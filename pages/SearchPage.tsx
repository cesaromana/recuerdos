import React, { useState, useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to fix resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { searchMemories } from '../services/memoryService';
import type { Memory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { LoadingSpinner } from '../components/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

const SearchPage: React.FC = () => {
  // FIX: Replaced useLocation with ReactRouterDOM.useLocation from namespace import.
  const location = ReactRouterDOM.useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  
  const [results, setResults] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchMemories(query).then(data => {
        setResults(data);
        setLoading(false);
      });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto animate-slideInUp">
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Búsqueda</CardTitle>
          <p className="text-muted-foreground pt-2">
            Mostrando resultados para: <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner className="w-10 h-10 text-accent" />
            </div>
          ) : results.length > 0 ? (
            <ul className="space-y-4">
              {results.map(memory => (
                <li key={memory.id} className="p-4 bg-secondary rounded-lg">
                  {/* FIX: Replaced Link with ReactRouterDOM.Link from namespace import. */}
                  <ReactRouterDOM.Link to={`/recuerdo/${memory.date}`} className="font-bold font-serif text-lg hover:text-accent transition-colors">
                    {memory.title}
                  </ReactRouterDOM.Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    {format(new Date(memory.date.replace(/-/g, '/')), 'dd MMMM, yyyy', { locale: es })}
                  </p>
                  <p className="text-sm text-foreground/80 line-clamp-2">{memory.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron recuerdos que coincidan con tu búsqueda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchPage;