import React, { useState, useRef, useEffect } from 'react';
// FIX: Reverted to namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { Heart, Search, Map, BarChart, Plus } from './Icons';
import { format } from 'date-fns/format';
import EasterEggFlower from './EasterEggFlower';


const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [heartClickCount, setHeartClickCount] = useState(0);
  const [flowerState, setFlowerState] = useState<'hidden' | 'visible' | 'hiding'>('hidden');
  const clickTimer = useRef<number | null>(null);

  const handleHeartClick = () => {
    setIsHeartFilled(current => !current);
    setIsAnimating(true);

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    const newClickCount = heartClickCount + 1;
    setHeartClickCount(newClickCount);

    if (newClickCount === 3) {
      setHeartClickCount(0);
      setFlowerState('visible');
      setTimeout(() => {
        setFlowerState('hiding');
      }, 2500); // La flor es visible por 2.5 segundos antes de desaparecer
    } else {
      // Reinicia el contador si los clics no son consecutivos
      clickTimer.current = window.setTimeout(() => {
        setHeartClickCount(0);
      }, 800); // El usuario tiene 800ms entre clics
    }
  };

  // Limpia el temporizador cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCreateToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    navigate(`/crear?date=${today}`);
  };

  return (
    <>
      {flowerState !== 'hidden' && (
        <EasterEggFlower
          state={flowerState}
          onHide={() => setFlowerState('hidden')}
        />
      )}
      <header className="flex items-center justify-between flex-wrap gap-4 p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={handleHeartClick} onAnimationEnd={() => setIsAnimating(false)} className="flex-shrink-0">
            <Heart 
                isFilled={isHeartFilled} 
                className={`h-7 w-7 text-accent ${isAnimating ? 'animate-heartbeat' : ''}`}
              />
          </button>
          <ReactRouterDOM.Link to="/">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground whitespace-nowrap">Nuestro Diario</h1>
          </ReactRouterDOM.Link>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 order-3 sm:order-2">
           <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="search"
              placeholder="Buscar recuerdos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-10 pr-4 rounded-md border border-input bg-background/50 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2 order-2 sm:order-3">
          {/* Botón para añadir recuerdo */}
          <Button onClick={handleCreateToday} variant="ghost" size="icon" className="sm:hidden" aria-label="Añadir recuerdo">
              <Plus className="h-6 w-6"/>
          </Button>
          <Button onClick={handleCreateToday} variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Añadir
          </Button>

          <ReactRouterDOM.Link to="/mapa">
              <Button variant="ghost" size="icon" aria-label="Mapa">
                  <Map className="h-5 w-5"/>
              </Button>
          </ReactRouterDOM.Link>
          <ReactRouterDOM.Link to="/resumen">
              <Button variant="ghost" size="icon" aria-label="Resúmenes">
                  <BarChart className="h-5 w-5"/>
              </Button>
          </ReactRouterDOM.Link>
          <Button onClick={logout} variant="ghost" size="sm">
            Salir
          </Button>
        </nav>
      </header>
    </>
  );
};

export default Header;