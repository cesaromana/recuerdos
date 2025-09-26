import React, { useState, useEffect } from 'react';

interface ZoomPreviewProps {
  src: string;
  initialRect: DOMRect;
  onClose: () => void;
}

const ZoomPreview: React.FC<ZoomPreviewProps> = ({ src, initialRect, onClose }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: `${initialRect.top}px`,
    left: `${initialRect.left}px`,
    width: `${initialRect.width}px`,
    height: `${initialRect.height}px`,
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 100,
  });

  const [isZoomed, setIsZoomed] = useState(false);

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const aspect = initialRect.width / initialRect.height;

      let targetWidth = Math.min(viewportWidth * 0.9, 800);
      let targetHeight = targetWidth / aspect;

      if (targetHeight > viewportHeight * 0.9) {
        targetHeight = viewportHeight * 0.9;
        targetWidth = targetHeight * aspect;
      }

      setStyle(s => ({
        ...s,
        top: '50%',
        left: '50%',
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        transform: 'translate(-50%, -50%)',
      }));
      setIsZoomed(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [initialRect]);

  // Animate out
  const handleClose = () => {
    setIsZoomed(false);
    setStyle(s => ({
      ...s,
      top: `${initialRect.top}px`,
      left: `${initialRect.left}px`,
      width: `${initialRect.width}px`,
      height: `${initialRect.height}px`,
      transform: 'none',
    }));
  };
  
  // Clean up after animation
  const onTransitionEnd = () => {
    if (!isZoomed) {
      onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeInBg" 
        onClick={handleClose}
        style={{ animationDuration: '300ms' }}
    >
      <img
        src={src}
        alt="Zoomed preview"
        style={style}
        onTransitionEnd={onTransitionEnd}
        className="object-cover rounded-lg shadow-2xl"
      />
    </div>
  );
};

export default ZoomPreview;
