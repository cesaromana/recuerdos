import React, { useState, useEffect } from 'react';
// FIX: Switched from a namespace import to a named import for react-router-dom to fix resolution errors.
import { Link } from 'react-router-dom';
import { getMemories } from '../services/memoryService';
import type { Memory } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { LoadingSpinner, MapPin } from '../components/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

const MapPage: React.FC = () => {
  const [memoriesWithLocation, setMemoriesWithLocation] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemories().then(allMemories => {
      const filteredAndSorted = allMemories
        .filter(m => m.location)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMemoriesWithLocation(filteredAndSorted);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="w-12 h-12 text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slideInUp">
      <CardHeader className="px-0">
        <CardTitle>Mapa de Nuestras Aventuras</CardTitle>
        <CardDescription>
          Un viaje cronológico por los lugares que han marcado nuestra historia.
        </CardDescription>
      </CardHeader>

      <div className="mt-8">
        {memoriesWithLocation.length > 0 ? (
          <div className="relative pl-12 sm:pl-16">
            {/* The vertical timeline line */}
            <div 
              className="absolute left-0 top-0 h-full border-l-2 border-dashed border-muted/30"
              style={{ left: '28px' }}
              aria-hidden="true"
            />
            
            <div className="space-y-16">
              {memoriesWithLocation.map((memory) => (
                <div key={memory.id} className="relative">
                  {/* The image "pin" on the timeline */}
                  {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
                  <Link to={`/recuerdo/${memory.date}`} className="absolute -left-1.5 top-0">
                    <img 
                      src={memory.coverImageUrl} 
                      alt={memory.title}
                      className="w-16 h-16 object-cover rounded-full border-4 border-background shadow-lg transition-transform hover:scale-110"
                    />
                  </Link>
                  
                  {/* The content */}
                  <div className="pl-12 ml-4 group">
                    <p className="text-sm text-muted-foreground font-medium">
                      {format(new Date(memory.date.replace(/-/g, '/')), 'dd MMMM, yyyy', { locale: es })}
                    </p>
                    {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
                    <Link to={`/recuerdo/${memory.date}`}>
                      <h3 className="text-2xl font-serif font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
                        {memory.title}
                      </h3>
                    </Link>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(memory.location || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-foreground/70 mt-3 hover:text-accent transition-colors"
                    >
                      <MapPin className="w-4 h-4"/>
                      {memory.location}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
           <Card>
              <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aún no hay recuerdos con ubicaciones guardadas para mostrar en el mapa.</p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapPage;