import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner, Search, X, Play, Pause, Music } from './Icons';
import Input from './Input';
import Button from './Button';

interface SpotifyTrack {
    id: string;
    name: string;
    artists: string;
    albumImageUrl: string;
    previewUrl?: string;
}

interface SpotifySearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTrackSelect: (track: SpotifyTrack) => void;
}

const SpotifySearchModal: React.FC<SpotifySearchModalProps> = ({ isOpen, onClose, onTrackSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SpotifyTrack[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Stop audio when modal is closed
        if (!isOpen && audioRef.current) {
            audioRef.current.pause();
            setPlayingTrackId(null);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/spotify?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setResults(data.tracks || []);
            } catch (error) {
                console.error("Error searching Spotify", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);
    
    const handlePlayToggle = (e: React.MouseEvent, track: SpotifyTrack) => {
        e.stopPropagation(); // Prevent selecting the track
        if (!track.previewUrl) return;

        if (playingTrackId === track.id) {
            audioRef.current?.pause();
            setPlayingTrackId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = track.previewUrl;
                audioRef.current.play().catch(console.error);
                setPlayingTrackId(track.id);
            }
        }
    };
    
    const handleSelect = (track: SpotifyTrack) => {
        onTrackSelect(track);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeInBg" onClick={onClose}>
            <div 
                className="bg-card w-full max-w-lg h-[90vh] max-h-[700px] rounded-2xl flex flex-col shadow-premium animate-scaleIn"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold">Buscar Canción</h2>
                     <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </header>
                <div className="p-4">
                    <div className="relative">
                        <Input 
                            type="search"
                            placeholder="Artistas, canciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base"
                            autoFocus
                        />
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto px-4 pb-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <LoadingSpinner className="w-8 h-8 text-accent" />
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="space-y-2">
                           {results.map(track => (
                               <li 
                                   key={track.id} 
                                   className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                                   onClick={() => handleSelect(track)}
                               >
                                   <div className="relative flex-shrink-0 w-16 h-16">
                                       <img src={track.albumImageUrl} alt={track.name} className="w-full h-full object-cover rounded-md" />
                                       {track.previewUrl && (
                                           <button
                                               onClick={(e) => handlePlayToggle(e, track)}
                                               className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                               aria-label={`Reproducir preview de ${track.name}`}
                                           >
                                               {playingTrackId === track.id ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                                           </button>
                                       )}
                                   </div>
                                   <div className="flex-grow min-w-0">
                                       <p className="font-semibold text-foreground truncate">{track.name}</p>
                                       <p className="text-sm text-muted-foreground truncate">{track.artists}</p>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    ) : searchQuery.trim().length > 0 && !isLoading ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No se encontraron resultados para "{searchQuery}".</p>
                        </div>
                    ) : (
                         <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
                            <Music className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-semibold">Encuentra la banda sonora perfecta</p>
                            <p className="text-sm">para tu recuerdo.</p>
                        </div>
                    )}
                </div>
                 <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />
            </div>
        </div>
    );
};

export default SpotifySearchModal;
