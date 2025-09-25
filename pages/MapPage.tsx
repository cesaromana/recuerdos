import React, { useState, useEffect } from 'react';
// FIX: Use named imports for react-router-dom to fix resolution errors.
// FIX: Changed to namespace import to fix module resolution errors.
// FIX: Reverted to named imports to resolve component properties.
import * as ReactRouterDOM from 'react-router-dom';
import { getMemories } from '../services/memoryService';
import type { Memory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { LoadingSpinner, MapPin } from '../components/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

const MapPage: React.FC = () => {
  const [memoriesWithLocation, setMemoriesWithLocation] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemories().then(allMemories => {
      const filtered = allMemories.filter(m => m.location);
      setMemoriesWithLocation(filtered);
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
    <div className="max-w-5xl mx-auto animate-slideInUp">
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Nuestras Aventuras</CardTitle>
           <p className="text-muted-foreground pt-2">
            Aquí están todos los lugares especiales que hemos guardado. En el futuro, esto será un mapa interactivo.
          </p>
        </CardHeader>
        <CardContent>
          {memoriesWithLocation.length > 0 ? (
            <ul className="space-y-4">
              {memoriesWithLocation.map(memory => (
                <li key={memory.id} className="p-4 bg-secondary rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
                    <ReactRouterDOM.Link to={`/recuerdo/${memory.date}`} className="font-bold font-serif hover:text-accent transition-colors">
                      {memory.title}
                    </ReactRouterDOM.Link>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(memory.date.replace(/-/g, '/')), 'dd MMMM, yyyy', { locale: es })}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(memory.location || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-accent hover:underline whitespace-nowrap"
                  >
                    <MapPin className="w-4 h-4" />
                    {memory.location}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aún no hay recuerdos con ubicaciones guardadas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPage;