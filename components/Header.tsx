import React, { useState } from 'react';
// FIX: Switched from a namespace import to named imports for react-router-dom to fix resolution errors.
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { Heart, Search, Map, BarChart, Plus } from './Icons';
import { format } from 'date-fns/format';


const Header: React.FC = () => {
  const { logout } = useAuth();
  // FIX: Replaced ReactRouterDOM.useNavigate with useNavigate from named import.
  const navigate = useNavigate();
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
    setIsAnimating(true);
  };

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
    <header className="flex items-center justify-between flex-wrap gap-4 p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
        <Link to="/" className="flex items-center gap-3">
            <button onClick={handleHeartClick} onAnimationEnd={() => setIsAnimating(false)} className="flex-shrink-0">
              <Heart 
                  isFilled={isHeartFilled} 
                  className={`h-7 w-7 text-accent ${isAnimating ? 'animate-heartbeat' : ''}`}
                />
            </button>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground whitespace-nowrap">Nuestro Diario</h1>
        </Link>
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

        {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
        <Link to="/mapa">
            <Button variant="ghost" size="icon" aria-label="Mapa">
                <Map className="h-5 w-5"/>
            </Button>
        </Link>
        {/* FIX: Replaced ReactRouterDOM.Link with Link from named import. */}
        <Link to="/resumen">
            <Button variant="ghost" size="icon" aria-label="Resúmenes">
                <BarChart className="h-5 w-5"/>
            </Button>
        </Link>
        <Button onClick={logout} variant="ghost" size="sm">
          Salir
        </Button>
      </nav>
    </header>
  );
};

export default Header;