import React from 'react';

// Nuevo SVG de flor, con diseño simétrico, limpio y elegante.
const FlowerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <radialGradient id="petalGradient" cx="50%" cy="80%" r="100%" fx="50%" fy="100%">
                <stop offset="0%" stopColor="#D94686" />
                <stop offset="100%" stopColor="#F472B6" />
            </radialGradient>
            {/* Un solo pétalo definido para garantizar la simetría */}
            <path id="petal" d="M12 2 C 9 6, 9 11, 12 12 C 15 11, 15 6, 12 2 Z" />
            <filter id="flower_shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g style={{ filter: 'url(#flower_shadow)' }}>
            <g fill="url(#petalGradient)">
                {/* Usamos el mismo pétalo rotado 5 veces para una simetría perfecta */}
                <use href="#petal" transform="rotate(0, 12, 12)" />
                <use href="#petal" transform="rotate(72, 12, 12)" />
                <use href="#petal" transform="rotate(144, 12, 12)" />
                <use href="#petal" transform="rotate(216, 12, 12)" />
                <use href="#petal" transform="rotate(288, 12, 12)" />
            </g>
        </g>
        <circle cx="12" cy="12" r="2.5" fill="#FBBF24"/>
        <circle cx="12" cy="12" r="1.5" fill="#FDE68A"/>
    </svg>
);


interface EasterEggFlowerProps {
  state: 'visible' | 'hiding';
  onHide: () => void;
}

const EasterEggFlower: React.FC<EasterEggFlowerProps> = ({ state, onHide }) => {
    // Clases de animación separadas para el fondo y la flor
    const bgAnimationClass = state === 'visible' ? 'animate-fadeInBg' : 'animate-fadeOutBg';
    const flowerAnimationClass = state === 'visible' ? 'animate-bloomIn' : 'animate-bloomOut';

    return (
        <div 
            onAnimationEnd={(e) => {
                // Asegurarse de que el evento proviene del contenedor principal
                if (e.target === e.currentTarget && state === 'hiding') {
                    onHide();
                }
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm ${bgAnimationClass}`}
            aria-hidden="true"
        >
            <FlowerIcon className={flowerAnimationClass} />
        </div>
    );
};

export default EasterEggFlower;