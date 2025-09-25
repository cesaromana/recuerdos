import React, { useState, useEffect, useCallback } from 'react';
// FIX: Switched from a namespace import to named imports for react-router-dom to fix resolution errors.
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMemoryByDate } from '../services/memoryService';
import type { Memory } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Button from '../components/Button';
import { ChevronLeft, LoadingSpinner, Edit, Trash, MapPin, X, ChevronRight } from '../components/Icons';

const Lightbox: React.FC<{
  images: { url: string; type: string }[];
  startIndex: number;
  onClose: () => void;
}> = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);
  
  const image = images[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-scaleIn" onClick={onClose}>
      <div className="relative w-full h-full max-w-4xl max-h-4/5" onClick={e => e.stopPropagation()}>
        <img src={image.url} alt="Vista ampliada" className="w-full h-full object-contain" />
      </div>
       <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:text-white" onClick={onClose}>
        <X className="w-8 h-8"/>
      </Button>
       {images.length > 1 && (
        <>
          <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white" onClick={goToPrevious}>
            <ChevronLeft className="w-8 h-8"/>
          </Button>
          <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white" onClick={goToNext}>
            <ChevronRight className="w-8 h-8"/>
          </Button>
        </>
      )}
    </div>
  );
};


const ViewMemoryPage: React.FC = () => {
  // FIX: Replaced ReactRouterDOM.useParams with useParams from named import.
  const { date } = useParams<{ date: string }>();
  // FIX: Replaced ReactRouterDOM.useNavigate with useNavigate from named import.
  const navigate = useNavigate();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);


  useEffect(() => {
    if (date) {
      setLoading(true);
      getMemoryByDate(date)
        .then(data => { if (data) setMemory(data); })
        .finally(() => setLoading(false));
    }
  }, [date]);
  
  const handleDelete = async () => {
    if (memory && window.confirm('¿Estás seguro de que quieres eliminar este recuerdo? Esta acción no se puede deshacer y borrará todas las fotos asociadas.')) {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/delete-memory?id=${memory.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete memory');
            }
            navigate('/');
        } catch (error: any) {
            alert(`Hubo un error al eliminar el recuerdo: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center flex-col h-64 text-accent">
            <LoadingSpinner className="h-12 w-12" />
            <p className="mt-4 text-foreground/80">Cargando recuerdo...</p>
        </div>
    );
  }

  if (!memory) {
    return (
      <div className="text-center p-10 animate-slideInUp">
        <h2 className="text-2xl font-serif font-bold mb-4">No se encontró el recuerdo</h2>
        <p className="mb-6">No hay nada guardado para el día {date}.</p>
        <Button onClick={() => navigate('/')}>Volver al calendario</Button>
      </div>
    );
  }
  
  const formattedDate = format(new Date(memory.date.replace(/-/g, '/')), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es });
  const imageMedia = memory.media.filter(m => m.type === 'image');

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox 
          images={imageMedia} 
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <div className="max-w-6xl mx-auto animate-slideInUp">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
              Volver al Diario
            </Button>
            <div className="flex items-center gap-2">
                {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
                <Link to={`/editar/${memory.date}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Editar
                    </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2">
                    {isDeleting ? <LoadingSpinner className="w-4 h-4" /> : <Trash className="w-4 h-4" />}
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </div>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-80 md:h-[500px] rounded-2xl shadow-premium overflow-hidden mb-12">
            <img src={memory.coverImageUrl} alt={memory.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
                <p className="font-semibold capitalize mb-2">{formattedDate}</p>
                <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">{memory.title}</h1>
            </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  <p>{memory.description}</p>
              </div>
          </div>
          <aside className="mt-8 lg:mt-0">
              <div className="bg-secondary p-6 rounded-2xl sticky top-28">
                  <h3 className="font-serif font-bold text-xl mb-4">Detalles</h3>
                  <ul className="space-y-3">
                      {memory.location && (
                          <li className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 mt-1 text-accent flex-shrink-0"/>
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(memory.location)}`} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-accent transition-colors">
                                  {memory.location}
                              </a>
                          </li>
                      )}
                  </ul>
              </div>
          </aside>
        </div>
        
        {/* Gallery Section */}
        {imageMedia.length > 0 && (
            <div className="mt-16">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-8">Galería del día</h2>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {imageMedia.map((m, index) => (
                        <div 
                          key={m.id} 
                          className="overflow-hidden rounded-xl shadow-md group cursor-pointer break-inside-avoid animate-scaleIn"
                          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                          onClick={() => setLightboxIndex(index)}
                        >
                            <img src={m.url} alt="Memory media" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default ViewMemoryPage;