import React from 'react';

// Un SVG de flor de hibisco, más elegante y orgánico.
const FlowerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <filter id="flower_shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15"/>
            </filter>
        </defs>
        <g style={{ filter: 'url(#flower_shadow)' }}>
            <path d="M15.5,13.9 C15.2,14.5 14.8,15.1 14.3,15.7 C13.8,16.4 13.2,17.1 12.5,17.7 C11.8,18.4 11,19 10,19.4 C9,19.8 8,20 7,19.8 C6,19.6 5.1,19.1 4.3,18.3 C3.5,17.5 3,16.5 2.8,15.5 C2.6,14.5 2.8,13.5 3.2,12.5 C3.6,11.5 4.2,10.6 4.9,9.9 C5.5,9.2 6.1,8.6 6.7,8.1 C7.3,7.6 7.8,7.1 8.3,6.6 C9.4,5.6 10.4,4.6 11.2,3.4 C11.6,2.8 12.2,2.3 12.9,2 C13.6,1.7 14.4,1.8 15.1,2.1 C15.8,2.4 16.4,3 16.8,3.6 C17.2,4.3 17.5,5.1 17.4,5.9 C17.3,6.7 17,7.5 16.5,8.2 C15.5,9.7 14.2,10.9 12.9,12.1 C12.3,12.7 11.8,13.3 11.4,14 C12.8,13.5 14.2,13.4 15.5,13.9 Z" fill="#F472B6"/>
            <path d="M12.9,2.1 C13.3,2.4 13.7,2.8 14.2,3.3 C14.6,3.8 15.1,4.3 15.7,4.9 C16.3,5.5 16.9,6.1 17.6,6.7 C18.3,7.3 18.9,7.9 19.5,8.5 C20.1,9.2 20.6,9.9 21,10.7 C21.4,11.5 21.6,12.4 21.4,13.3 C21.2,14.2 20.7,15.1 20,15.8 C19.3,16.5 18.4,16.9 17.5,17.1 C16.6,17.3 15.7,17.1 14.9,16.7 C14.1,16.3 13.3,15.7 12.7,15 C11.5,13.6 10.4,12.3 9.3,11 C8.8,10.4 8.2,9.8 7.6,9.3 C8.4,9.6 9.2,9.9 10,10.1 C10.9,10.4 11.8,10.6 12.7,10.5 C13.7,10.4 14.6,10.1 15.5,9.5 C16.4,8.9 17.1,8.1 17.6,7.2 C18.1,6.3 18.4,5.3 18.3,4.3 C18.2,3.3 17.8,2.4 17.1,1.7 C16.5,1 15.6,0.5 14.7,0.2 C13.8,-0.1 12.8,-0.1 11.9,0.3 C11,0.7 10.2,1.3 9.6,2.1 C9.1,2.8 8.6,3.5 8.1,4.2 C8.8,3.7 9.5,3.3 10.2,3 C10.9,2.7 11.6,2.5 12.4,2.5 C12.6,2.5 12.7,2.5 12.9,2.5 L12.9,2.1 Z" fill="#EC4899"/>
            <path d="M12,12.5 C11.9,13.3 11.7,14.1 11.4,14.9 C11.1,15.7 10.7,16.4 10.2,17.1 C9.7,17.8 9.1,18.4 8.4,18.9 C7.7,19.4 6.9,19.8 6.1,20 C5.3,20.2 4.4,20.2 3.6,20 C2.8,19.8 2,19.3 1.4,18.6 C0.8,17.9 0.4,17.1 0.2,16.2 C0,15.3 0.1,14.4 0.3,13.5 C0.5,12.6 0.9,11.8 1.5,11.1 C2.5,9.7 3.8,8.5 5.1,7.3 C5.7,6.7 6.2,6.1 6.6,5.4 C5.2,5.9 3.8,6 2.5,6.5 C1.8,6.8 1.1,7.2 0.6,7.8 C0.1,8.4 -0.1,9.2 0,10 C0.1,10.8 0.5,11.5 1,12.1 C2,13.2 3.1,14.1 4.4,14.7 C5,15 5.6,15.2 6.2,15.4 C6.8,15.6 7.5,15.7 8.1,15.6 C8.7,15.5 9.3,15.3 9.9,15 C11.1,14.3 12.1,13.4 12.9,12.3 C12.9,12.4 12.9,12.4 12.9,12.5 L12,12.5 Z" fill="#D94686" transform="translate(5, -1) rotate(15, 12, 12)" />
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