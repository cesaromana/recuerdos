import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getMemoryByDate } from '../services/memoryService';
import type { Memory } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Button from '../components/Button';
import { ChevronLeft, LoadingSpinner, Edit, Trash, MapPin, Tag } from '../components/Icons';

const ViewMemoryPage: React.FC = () => {
  const { date } = ReactRouterDOM.useParams<{ date: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (date) {
      setLoading(true);
      getMemoryByDate(date)
        .then(data => {
          if (data) {
            setMemory(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [date]);
  
  const handleDelete = async () => {
    if (memory && window.confirm('¿Estás seguro de que quieres eliminar este recuerdo? Esta acción no se puede deshacer y borrará todas las fotos asociadas.')) {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/delete-memory?id=${memory.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete memory');
            }
            
            navigate('/');

        } catch (error: any) {
            console.error("Deletion failed:", error);
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
        <Button onClick={() => navigate('/')}>
          Volver al calendario
        </Button>
      </div>
    );
  }
  
  const formattedDate = format(new Date(memory.date.replace(/-/g, '/')), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es });

  return (
    <div className="max-w-5xl mx-auto animate-slideInUp">
       <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
             <ReactRouterDOM.Link to={`/editar/${memory.date}`}>
                 <Button variant="outline" size="sm" className="flex items-center gap-2">
                     <Edit className="w-4 h-4" />
                     Editar
                 </Button>
             </ReactRouterDOM.Link>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2">
                  {isDeleting ? <LoadingSpinner className="w-4 h-4" /> : <Trash className="w-4 h-4" />}
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
          </div>
       </div>

      <div className="bg-card rounded-xl shadow-premium overflow-hidden">
        <img src={memory.coverImageUrl} alt={memory.title} className="w-full h-64 md:h-96 object-cover" />
        <div className="p-6 md:p-10">
            <p className="text-accent font-semibold capitalize mb-2">{formattedDate}</p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">{memory.title}</h1>

             <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 text-sm text-muted-foreground">
                {memory.location && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(memory.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                        <MapPin className="w-4 h-4"/> {memory.location}
                    </a>
                )}
                {memory.tags && memory.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                       <Tag className="w-4 h-4" />
                        {memory.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-secondary rounded-md text-xs font-medium">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base md:text-lg">{memory.description}</p>
        </div>
        
        {memory.media.length > 0 && (
            <div className="p-6 md:p-10 border-t border-border">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Galería del día</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {memory.media.map((m, index) => (
                        <div 
                          key={m.id} 
                          className="aspect-square rounded-lg overflow-hidden shadow-md group animate-scaleIn"
                          style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}
                        >
                            <img src={m.url} alt="Memory media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ViewMemoryPage;