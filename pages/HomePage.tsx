import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Reverted to namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { getMemories } from '../services/memoryService';
import type { Memory } from '../types';
// FIX: Use subpath imports for date-fns functions that were causing errors.
import { format, endOfMonth, eachDayOfInterval, getDay, addMonths, isToday } from 'date-fns';
import { startOfMonth } from 'date-fns/startOfMonth';
import { subMonths } from 'date-fns/subMonths';
// FIX: Use direct import for date-fns locale to fix module resolution error.
import { es } from 'date-fns/locale/es';
import Button from '../components/Button';
import { ChevronLeft, ChevronRight, Plus } from '../components/Icons';
import ZoomPreview from '../components/ZoomPreview';

const OnThisDay: React.FC<{ memories: Memory[] }> = ({ memories }) => {
  const today = new Date();
  const pastMemories = useMemo(() => {
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    return memories.filter(memory => {
      const memoryDate = new Date(memory.date.replace(/-/g, '/'));
      return memoryDate.getDate() === currentDay &&
             memoryDate.getMonth() === currentMonth &&
             memoryDate.getFullYear() < today.getFullYear();
    });
  }, [memories]);

  if (pastMemories.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary p-4 rounded-xl shadow-premium mb-6 animate-slideInUp">
      <h3 className="text-lg font-serif font-bold text-foreground mb-2">En un día como hoy...</h3>
      <ul className="space-y-2">
        {pastMemories.map(memory => {
          const memoryYear = new Date(memory.date.replace(/-/g, '/')).getFullYear();
          const yearsAgo = today.getFullYear() - memoryYear;
          return (
            <li key={memory.id}>
              <ReactRouterDOM.Link 
                to={`/recuerdo/${memory.date}`} 
                className="text-sm text-foreground/80 hover:text-accent transition-colors"
              >
                ...hace <strong>{yearsAgo}</strong> {yearsAgo === 1 ? 'año' : 'años'}, {memory.title}.
              </ReactRouterDOM.Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};


const CalendarHeader: React.FC<{
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex items-center justify-between px-2 py-4">
    <Button onClick={onPrevMonth} variant="ghost" size="icon">
      <ChevronLeft className="h-6 w-6" />
    </Button>
    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground capitalize">
      {format(currentDate, 'MMMM yyyy', { locale: es })}
    </h2>
    <Button onClick={onNextMonth} variant="ghost" size="icon">
      <ChevronRight className="h-6 w-6" />
    </Button>
  </div>
);

const CalendarGrid: React.FC<{ 
    days: Date[], 
    memoriesByDate: Map<string, Memory>, 
    isSwitching: boolean,
    onNavigate: (e: React.MouseEvent) => void,
    onDayPressStart: (e: React.MouseEvent | React.TouchEvent, memory: Memory) => void,
    onDayPressEnd: () => void,
}> = ({ days, memoriesByDate, isSwitching, onNavigate, onDayPressStart, onDayPressEnd }) => {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const firstDayOfMonth = getDay(days[0]);

    return (
        <div className={`grid grid-cols-7 gap-1 md:gap-2 transition-opacity duration-700 ${isSwitching ? 'opacity-0' : 'opacity-100'}`}>
            {weekdays.map((day) => (
                <div key={day} className="text-center font-medium text-muted-foreground text-xs sm:text-sm py-2">
                    {day}
                </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="border-t border-l border-border/50 rounded-lg bg-secondary/30" />
            ))}
            {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const memory = memoriesByDate.get(dateKey);
                const isCurrentDay = isToday(day);
                const targetUrl = memory ? `/recuerdo/${dateKey}` : `/crear?date=${dateKey}`;
                
                return (
                    <ReactRouterDOM.Link 
                        to={targetUrl} 
                        key={day.toString()} 
                        onClick={onNavigate}
                        onMouseDown={memory ? (e) => onDayPressStart(e, memory) : undefined}
                        // FIX: Event handlers like onMouseUp expect a function that can take an event argument.
                        // Wrapping onDayPressEnd in an arrow function ensures it's called correctly without arguments.
                        onMouseUp={memory ? () => onDayPressEnd() : undefined}
                        onMouseLeave={memory ? () => onDayPressEnd() : undefined}
                        onTouchStart={memory ? (e) => onDayPressStart(e, memory) : undefined}
                        onTouchEnd={memory ? () => onDayPressEnd() : undefined}
                        onContextMenu={memory ? (e) => { e.preventDefault(); onDayPressEnd(); } : undefined}
                        className={`relative aspect-square border-t border-l border-border/50 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group overflow-hidden ${memory ? 'bg-secondary animate-pulse' : 'bg-card'}`}
                    >
                         {memory ? (
                             <>
                                <img src={memory.coverImageUrl} alt={memory.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover rounded-lg z-0 transition-transform duration-500 group-hover:scale-110"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                                <span className="absolute bottom-1 right-1 md:bottom-2 md:right-2 text-white font-bold text-xs md:text-sm">{format(day, 'd')}</span>
                             </>
                        ) : (
                            <div className="flex items-start justify-end p-2 h-full rounded-lg">
                                <span className={`font-medium text-sm md:text-base ${isCurrentDay ? 'text-accent font-bold' : 'text-foreground/70'}`}>{format(day, 'd')}</span>
                            </div>
                        )}
                        {isCurrentDay && <div className="absolute inset-0 rounded-lg ring-2 ring-accent pointer-events-none"></div>}
                    </ReactRouterDOM.Link>
                );
            })}
        </div>
    );
};


const HomePage: React.FC = () => {
  const [allMemories, setAllMemories] = useState<Memory[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSwitchingMonth, setIsSwitchingMonth] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [zoomPreview, setZoomPreview] = useState<{ src: string; rect: DOMRect } | null>(null);
  const longPressTimer = useRef<number>();
  const isLongPress = useRef(false);
  const location = ReactRouterDOM.useLocation();


  useEffect(() => {
    getMemories().then(setAllMemories);
  }, []);

  useEffect(() => {
    // Reset navigation lock when page changes
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [location]);
  
  const memoriesByDate = useMemo(() => {
    const map = new Map<string, Memory>();
    allMemories.forEach((memory) => {
      map.set(memory.date, memory);
    });
    return map;
  }, [allMemories]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const switchMonth = (newDate: Date) => {
    setIsSwitchingMonth(true);
    setTimeout(() => {
      setCurrentDate(newDate);
      setIsSwitchingMonth(false);
    }, 700);
  };

  const handleNextMonth = () => switchMonth(addMonths(currentDate, 1));
  const handlePrevMonth = () => switchMonth(subMonths(currentDate, 1));
  
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent, memory: Memory) => {
    isLongPress.current = false;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    longPressTimer.current = window.setTimeout(() => {
        isLongPress.current = true;
        setZoomPreview({ src: memory.coverImageUrl, rect });
    }, 300);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    if (isNavigating || isLongPress.current) {
      e.preventDefault();
    } else {
      setIsNavigating(true);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl animate-slideInUp">
      <OnThisDay memories={allMemories} />
       <div className="bg-card p-2 sm:p-4 rounded-xl shadow-premium">
            <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
            />
            <CalendarGrid 
              days={daysInMonth} 
              memoriesByDate={memoriesByDate} 
              isSwitching={isSwitchingMonth} 
              onNavigate={handleNavigate}
              onDayPressStart={handlePressStart}
              onDayPressEnd={handlePressEnd}
            />
       </div>
       {zoomPreview && (
        <ZoomPreview
          src={zoomPreview.src}
          initialRect={zoomPreview.rect}
          onClose={() => setZoomPreview(null)}
        />
      )}
    </div>
  );
};

export default HomePage;