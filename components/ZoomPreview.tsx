import React, { useState, useEffect, useRef } from 'react';

interface ZoomPreviewProps {
  src: string;
  initialRect: DOMRect;
  onClose: () => void;
}

const ZoomPreview: React.FC<ZoomPreviewProps> = ({ src, initialRect, onClose }) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const finalStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  const initialStyle: React.CSSProperties = {
    top: `${initialRect.top}px`,
    left: `${initialRect.left}px`,
    width: `${initialRect.width}px`,
    height: `${initialRect.height}px`,
  };

  useEffect(() => {
    // Usamos requestAnimationFrame para asegurar que el navegador haya renderizado
    // el estado inicial antes de aplicar el estado final y comenzar la transición.
    const animationFrame = requestAnimationFrame(() => {
      setIsAnimatingIn(true);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsAnimatingIn(false);
  };

  const onTransitionEnd = (e: React.TransitionEvent) => {
    // Nos aseguramos de que el evento de transición es para la imagen y que estamos cerrando
    if (e.target === imgRef.current && isClosing) {
      onClose();
    }
  };

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const aspect = initialRect.width / initialRect.height;

  let targetWidth = Math.min(viewportWidth * 0.9, 800);
  let targetHeight = targetWidth / aspect;

  if (targetHeight > viewportHeight * 0.9) {
    targetHeight = viewportHeight * 0.9;
    targetWidth = targetHeight * aspect;
  }
  
  finalStyle.width = `${targetWidth}px`;
  finalStyle.height = `${targetHeight}px`;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ease-in-out ${isAnimatingIn && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <img
        ref={imgRef}
        src={src}
        alt="Zoomed preview"
        style={{
          position: 'fixed',
          transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 101,
          ...(isAnimatingIn ? finalStyle : initialStyle),
        }}
        className="object-cover rounded-lg shadow-2xl"
        onTransitionEnd={onTransitionEnd}
      />
    </div>
  );
};

export default ZoomPreview;