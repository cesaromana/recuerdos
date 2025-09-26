import React, { useState, useEffect, useRef } from 'react';
// FIX: Reverted to namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale/es';
import { upload } from '@vercel/blob/client';
import { addMemory } from '../services/memoryService';
import type { MemoryMedia } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/Card';
import { UploadCloud, ChevronLeft } from '../components/Icons';

interface UploadedFile {
  file: File;
  previewUrl: string;
}

const CreateMemoryPage: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(dateFromQuery);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);


  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, [files]);
  
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [location]);

  const handleBackNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigate(-1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      if(coverImageIndex === null && newFiles.length > 0) {
        setCoverImageIndex(files.length);
      }
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
       setFiles(prev => [...prev, ...newFiles]);
       if(coverImageIndex === null && newFiles.length > 0) {
        setCoverImageIndex(files.length);
      }
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || files.length === 0 || coverImageIndex === null) {
      alert('Por favor, completa todos los campos y sube al menos una imagen.');
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    try {
      const uploadedMedia: MemoryMedia[] = [];

      // ETAPA 1: Subida de archivos
      for (const [index, f] of files.entries()) {
        try {
          const blob = await upload(f.file.name, f.file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          
          uploadedMedia.push({
            id: `${Date.now()}-${index}`,
            url: blob.url,
            type: f.file.type.startsWith('image/') ? 'image' : f.file.type.startsWith('video/') ? 'video' : 'audio'
          });

          setUploadProgress(((index + 1) / files.length) * 100);
        } catch (uploadError) {
          throw new Error(`Error al subir el archivo ${f.file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
        }
      }
    
      // ETAPA 2: Guardado en la base de datos
      const coverImageUrl = uploadedMedia[coverImageIndex].url;

      await addMemory({ 
          date, 
          title, 
          description, 
          media: uploadedMedia, 
          coverImageUrl,
          location: locationText
      });
      
      navigate('/');
    } catch (error) {
      alert(`Ocurrió un error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideInUp">
      <Button 
        variant="ghost" 
        onClick={handleBackNavigation}
        disabled={isNavigating}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </Button>
      <form onSubmit={handleSubmit}>
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Añadir un nuevo recuerdo</CardTitle>
            <CardDescription>
              Completa los detalles de este día especial. La fecha seleccionada es {format(new Date(date.replace(/-/g, '/')), 'dd MMMM, yyyy', { locale: es })}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium text-foreground/90">Título</label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Nuestra primera caminata" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="font-medium text-foreground/90">Fecha</label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="font-medium text-foreground/90">Descripción</label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe lo que hicieron, cómo se sintieron..." rows={6} required />
            </div>
            <div className="space-y-2">
                <label htmlFor="location" className="font-medium text-foreground/90">Ubicación (Opcional)</label>
                <Input id="location" value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="Ej: Parque Central, Ciudad" />
            </div>
            <div className="space-y-2">
                <label className="font-medium text-foreground/90">Fotos y Videos</label>
                <div 
                    className="flex justify-center items-center flex-col w-full p-8 border-2 border-dashed border-input rounded-lg cursor-pointer transition-colors hover:bg-secondary hover:border-accent"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                >
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-3"/>
                    <p className="font-semibold text-foreground/80">Haz clic o arrastra archivos aquí</p>
                    <p className="text-sm text-muted-foreground">Imágenes, videos o audios</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*,video/*,audio/*"/>
                </div>
            </div>
            {files.length > 0 && (
              <div className="space-y-4">
                <p className="font-medium text-foreground/90">Elige la imagen de portada:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map((f, index) => f.file.type.startsWith('image/') && (
                    <div key={index} className="relative cursor-pointer group animate-scaleIn" onClick={() => setCoverImageIndex(index)}>
                      <img src={f.previewUrl} alt="Preview" className={`w-full h-32 object-cover rounded-lg transition-all ${coverImageIndex === index ? 'ring-4 ring-accent ring-offset-2' : 'group-hover:opacity-80'}`} />
                      {coverImageIndex === index && (
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
            <div className="w-full flex items-center justify-end">
                {isSaving && (
                    <div className="w-full max-w-xs mr-4">
                        <p className="text-sm text-muted-foreground mb-1 text-right">{`Subiendo ${Math.round(uploadProgress)}%`}</p>
                        <div className="w-full bg-secondary rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                )}
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isSaving ? 'Guardando...' : 'Guardar Recuerdo'}
                </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CreateMemoryPage;