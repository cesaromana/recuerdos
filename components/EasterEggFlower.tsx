import React from 'react';

// Un SVG de flor estilizado y bonito
const FlowerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g filter="url(#filter0_d_101_2)">
            <path d="M100 30C100 30 130 50 140 70C150 90 130 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 30C100 30 70 50 60 70C50 90 70 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter0_d_101_2)" transform="rotate(60 100 100)">
            <path d="M100 30C100 30 130 50 140 70C150 90 130 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 30C100 30 70 50 60 70C50 90 70 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter0_d_101_2)" transform="rotate(120 100 100)">
            <path d="M100 30C100 30 130 50 140 70C150 90 130 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 30C100 30 70 50 60 70C50 90 70 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter0_d_101_2)" transform="rotate(180 100 100)">
            <path d="M100 30C100 30 130 50 140 70C150 90 130 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 30C100 30 70 50 60 70C50 90 70 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter0_d_101_2)" transform="rotate(240 100 100)">
            <path d="M100 30C100 30 130 50 140 70C150 90 130 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 30C100 30 70 50 60 70C50 90 70 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter0_d_101_2)" transform="rotate(300 100 100)">
            <path d="M100 30C100 30 130 50 140 70C150 90 130 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 30C100 30 70 50 60 70C50 90 70 110 100 110" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <circle cx="100" cy="100" r="25" fill="#FBBF24"/>
        <defs>
            <filter id="filter0_d_101_2" x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
            </filter>
        </defs>
    </svg>
);


interface EasterEggFlowerProps {
  state: 'visible' | 'hiding';
  onHide: () => void;
}

const EasterEggFlower: React.FC<EasterEggFlowerProps> = ({ state, onHide }) => {
    const animationClass = state === 'visible' ? 'animate-bloomIn' : 'animate-bloomOut';

    return (
        <div 
            onAnimationEnd={() => {
                if (state === 'hiding') {
                    onHide();
                }
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm ${animationClass}`}
            aria-hidden="true"
        >
            <FlowerIcon />
        </div>
    );
};

export default EasterEggFlower;