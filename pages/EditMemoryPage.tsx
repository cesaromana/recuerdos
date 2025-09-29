import React, { useState, useEffect, useRef } from 'react';
// FIX: Reverted to namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
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
  const { date: dateParam } = ReactRouterDOM.useParams<{ date: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memoryId, setMemoryId] = useState<string | null>(null);
  const [date, setDate] = useState(dateParam || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  
  const [newFiles, setNewFiles] = useState<UploadedFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<MemoryMedia[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadedMedia, setLoadedMedia] = useState(new Set<string>());

  const handleMediaLoad = (id: string) => {
    setLoadedMedia(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    if (dateParam) {
      getMemoryByDate(dateParam).then(memory => {
        if (memory) {
          setMemoryId(memory.id);
          setDate(memory.date);
          setTitle(memory.title);
          setDescription(memory.description);
          setLocationText(memory.location || '');
          setExistingMedia(memory.media);
          setCoverImageUrl(memory.coverImageUrl);
        }
        setIsLoading(false);
      });
    }
  }, [dateParam]);
  
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
    let isSuccess = false;

    try {
      const newUploadedMedia: MemoryMedia[] = [];
      const newFileUrlMap = new Map<string, string>();

      // Stage 1: Upload new files
      if (newFiles.length > 0) {
        for (const [index, f] of newFiles.entries()) {
          const blob = await upload(f.file.name, f.file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });

          const newMediaItem: MemoryMedia = {
            id: `${Date.now()}-${index}`,
            url: blob.url,
            type: f.file.type.startsWith('image/') ? 'image' : f.file.type.startsWith('video/') ? 'video' : 'audio',
          };
          newUploadedMedia.push(newMediaItem);
          newFileUrlMap.set(f.previewUrl, newMediaItem.url);
        }
      }

      // Stage 2: Prepare final data
      const allMedia = [...existingMedia, ...newUploadedMedia];
      let finalCoverImageUrl = coverImageUrl;
      if (newFileUrlMap.has(coverImageUrl)) {
        finalCoverImageUrl = newFileUrlMap.get(coverImageUrl)!;
      }

      // Stage 3: Update the database
      await updateMemory({
        id: memoryId,
        date,
        title,
        description,
        location: locationText,
        media: allMedia,
        coverImageUrl: finalCoverImageUrl,
      });
      
      isSuccess = true;
    } catch (error) {
      alert(`Ocurrió un error al guardar los cambios: ${error instanceof Error ? error.message : String(error)}`);
      isSuccess = false;
    }

    // Stage 4: Finalize UI state and navigate on success
    setIsSaving(false);
    if (isSuccess) {
      navigate(`/recuerdo/${date}`);
    }
  };
  
  const allMediaForDisplay = [
    ...existingMedia, 
    // FIX: The file's MIME type string is mapped to the specific 'image' | 'video' | 'audio' type required by the MemoryMedia interface.
    ...newFiles.map(f => ({ id: f.file.name, url: f.previewUrl, type: (f.file.type.startsWith('image/') ? 'image' : f.file.type.startsWith('video/') ? 'video' : 'audio') as 'image' | 'video' | 'audio' }))
  ];
  
  // FIX: Updated filter logic to use strict equality check with the corrected media type.
  const coverImageCandidates = allMediaForDisplay.filter(m => m.type === 'image');


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner className="w-12 h-12 text-accent" /></div>;
  }

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
                <Input id="location" value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="Ej: Parque Central, Ciudad" />
              </div>
            
            {allMediaForDisplay.length > 0 && (
                <div className="space-y-4">
                  <p className="font-medium text-foreground/90">Galería actual:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {allMediaForDisplay.map((m) => {
                          const hasLoaded = loadedMedia.has(m.id);
                          return (
                            <div key={m.id} className={`relative group animate-scaleIn rounded-lg overflow-hidden ${!hasLoaded ? 'bg-secondary animate-pulse' : ''}`}>
                                {/* FIX: Updated rendering logic to use strict equality check with the corrected media type. */}
                                {m.type === 'image' ? (
                                    <img 
                                      src={m.url} 
                                      alt="Preview" 
                                      onLoad={() => handleMediaLoad(m.id)}
                                      className={`w-full h-32 object-cover transition-opacity duration-500 ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                ) : (
                                    <video 
                                      src={m.url} 
                                      muted 
                                      loop 
                                      autoPlay 
                                      playsInline 
                                      onCanPlay={() => handleMediaLoad(m.id)}
                                      className={`w-full h-32 object-cover transition-opacity duration-500 ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                )}
                            </div>
                          )
                      })}
                  </div>
                </div>
            )}

             <div className="space-y-2">
                <label className="font-medium text-foreground/90">Añadir más fotos o videos</label>
                 <div 
                    className="flex justify-center items-center flex-col w-full p-8 border-2 border-dashed border-input rounded-lg cursor-pointer transition-colors hover:bg-secondary hover:border-accent"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-3"/>
                    <p className="font-semibold text-foreground/80">Haz clic para añadir nuevos archivos</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*,video/*,audio/*"/>
                </div>
            </div>
             {coverImageCandidates.length > 0 && (
              <div className="space-y-4">
                <p className="font-medium text-foreground/90">Elige la imagen de portada:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {coverImageCandidates.map((m) => {
                    const hasLoaded = loadedMedia.has(m.id);
                    return (
                      <div key={m.id} className={`relative cursor-pointer group animate-scaleIn rounded-lg ${!hasLoaded ? 'bg-secondary animate-pulse' : ''}`} onClick={() => setCoverImageUrl(m.url)}>
                        <img 
                          src={m.url} 
                          alt="Media preview" 
                          loading="lazy" 
                          onLoad={() => handleMediaLoad(m.id)}
                          className={`w-full h-32 object-cover rounded-lg transition-all ${coverImageUrl === m.url ? 'ring-4 ring-accent ring-offset-2' : 'group-hover:opacity-80'} ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {coverImageUrl === m.url && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <span className="text-white font-bold text-sm">Portada</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto ml-auto bg-accent text-accent-foreground hover:bg-accent/90">
              {isSaving ? <LoadingSpinner className="w-5 h-5 mr-2" /> : null}
              {isSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditMemoryPage;