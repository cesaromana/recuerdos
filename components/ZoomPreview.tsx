import React, { useState, useEffect } from 'react';

interface ZoomPreviewProps {
  src: string;
  initialRect: DOMRect;
  onClose: () => void;
}

const ZoomPreview: React.FC<ZoomPreviewProps> = ({ src, initialRect, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: `${initialRect.top}px`,
    left: `${initialRect.left}px`,
    width: `${initialRect.width}px`,
    height: `${initialRect.height}px`,
    transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)', // Slower, more graceful
    zIndex: 100,
  });
  const [bgOpacity, setBgOpacity] = useState(0);

  // Animate in
  useEffect(() => {
    // We use a timeout of 0 or requestAnimationFrame to ensure the initial state is rendered before applying the transition.
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
      
      setBgOpacity(1); // Start fading in the background
      setStyle(s => ({
        ...s,
        top: '50%',
        left: '50%',
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        transform: 'translate(-50%, -50%)',
      }));
    }, 10); // A tiny delay ensures the transition happens

    return () => clearTimeout(timer);
  }, [initialRect]);

  // Animate out
  const handleClose = () => {
    setIsClosing(true);
    setBgOpacity(0); // Start fading out the background
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
  const onTransitionEnd = (e: React.TransitionEvent) => {
    // Only trigger onClose when the component is in a closing state to avoid premature closing.
    if (isClosing && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" 
        onClick={handleClose}
        onTransitionEnd={onTransitionEnd}
        style={{ 
          opacity: bgOpacity, 
          transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)' // Sync with image
        }}
    >
      <img
        src={src}
        alt="Zoomed preview"
        style={style}
        className="object-cover rounded-lg shadow-2xl"
      />
    </div>
  );
};

export default ZoomPreview;
