import React, { useState, useEffect, useRef } from 'react';
// FIX: Use named imports for react-router-dom to fix resolution errors.
// FIX: Changed to namespace import to fix module resolution errors.
// FIX: Reverted to named imports to resolve component properties.
import { useParams, useNavigate } from 'react-router-dom';
import { getMemoryByDate, updateMemory } from '../services/memoryService';
import { upload } from '@vercel/blob/client';
import type { MemoryMedia } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/Card';
import { UploadCloud, ChevronLeft, LoadingSpinner } from '../components/Icons';

interface UploadedFile {
  file: File;
  previewUrl: string;
}

const EditMemoryPage: React.FC = () => {
  // FIX: Replaced ReactRouterDOM.useParams with useParams from named import.
  const { date: dateParam } = useParams<{ date: string }>();
  // FIX: Replaced ReactRouterDOM.useNavigate with useNavigate from named import.
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memoryId, setMemoryId] = useState<string | null>(null);
  const [date, setDate] = useState(dateParam || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  const [newFiles, setNewFiles] = useState<UploadedFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<MemoryMedia[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dateParam) {
      getMemoryByDate(dateParam).then(memory => {
        if (memory) {
          setMemoryId(memory.id);
          setDate(memory.date);
          setTitle(memory.title);
          setDescription(memory.description);
          setLocation(memory.location || '');
          setExistingMedia(memory.media);
          setCoverImageUrl(memory.coverImageUrl);
        }
        setIsLoading(false);
      });
    }
  }, [dateParam]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // FIX: Add explicit type `File` to the `file` parameter to prevent it from being inferred as `unknown`.
      const addedFiles = Array.from(event.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setNewFiles(prev => [...prev, ...addedFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !memoryId || !coverImageUrl) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    setIsSaving(true);
    let newUploadedMedia: MemoryMedia[] = [];

    // ETAPA 1: Subida de nuevos archivos (si los hay)
    try {
        if(newFiles.length > 0) {
             for (const [index, f] of newFiles.entries()) {
                try {
                    const blob = await upload(f.file.name, f.file, {
                        access: 'public',
                        handleUploadUrl: '/api/upload',
                    });
                    
                    newUploadedMedia.push({
                        id: `${Date.now()}-${index}`,
                        url: blob.url,
                        type: f.file.type.startsWith('image/') ? 'image' : f.file.type.startsWith('video/') ? 'video' : 'audio'
                    });
                } catch (uploadError) {
                    throw new Error(`Error al subir el nuevo archivo ${f.file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
                }
            }
        }
    } catch (error) {
        alert(error instanceof Error ? error.message : String(error));
        setIsSaving(false);
        return; // Detener la ejecución si la subida falla
    }
    
    // ETAPA 2: Actualización en la base de datos
    try {
        const allMedia = [...existingMedia, ...newUploadedMedia];
        
        await updateMemory({
            id: memoryId,
            date,
            title,
            description,
            location,
            media: allMedia,
            coverImageUrl,
        });
        
        navigate(`/recuerdo/${date}`);
    } catch (dbError) {
        alert(`Error al guardar los cambios en la base de datos: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    } finally {
        setIsSaving(false);
    }
  };
  
  const allMediaForSelection = [
    ...existingMedia, 
    ...newFiles.map(f => ({ id: f.file.name, url: f.previewUrl, type: 'image' as const }))
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner className="w-12 h-12 text-accent" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-slideInUp">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </Button>
      <form onSubmit={handleSubmit}>
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Editar Recuerdo</CardTitle>
            <CardDescription>
              Modifica los detalles de este día especial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium text-foreground/90">Título</label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="font-medium text-foreground/90">Fecha</label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="font-medium text-foreground/90">Descripción</label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} required />
            </div>
             <div className="space-y-2">
                <label htmlFor="location" className="font-medium text-foreground/90">Ubicación (Opcional)</label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Parque Central, Ciudad" />
              </div>
             <div className="space-y-2">
                <label className="font-medium text-foreground/90">Añadir más fotos</label>
                 <div 
                    className="flex justify-center items-center flex-col w-full p-8 border-2 border-dashed border-input rounded-lg cursor-pointer transition-colors hover:bg-secondary hover:border-accent"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-3"/>
                    <p className="font-semibold text-foreground/80">Haz clic para añadir nuevos archivos</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*,video/*,audio/*"/>
                </div>
            </div>
             {allMediaForSelection.length > 0 && (
              <div className="space-y-4">
                <p className="font-medium text-foreground/90">Elige la imagen de portada:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allMediaForSelection.map((m) => m.type.startsWith('image/') && (
                    <div key={m.id} className="relative cursor-pointer group animate-scaleIn" onClick={() => setCoverImageUrl(m.url)}>
                      <img src={m.url} alt="Media preview" className={`w-full h-32 object-cover rounded-lg transition-all ${coverImageUrl === m.url ? 'ring-4 ring-accent ring-offset-2' : 'group-hover:opacity-80'}`} />
                      {coverImageUrl === m.url && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <span className="text-white font-bold text-sm">Portada</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto ml-auto bg-accent text-accent-foreground hover:bg-accent/90">
              {isSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditMemoryPage;