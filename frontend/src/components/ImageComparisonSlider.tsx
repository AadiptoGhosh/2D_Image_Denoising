import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Noisy Input',
  afterLabel = 'Denoised',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none cursor-ew-resize rounded-lg border border-slate-200 bg-slate-900 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      style={{ touchAction: 'none' }}
    >
      {/* After Image (Background, full width) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="block w-full h-auto object-contain max-h-[500px] pointer-events-none"
      />

      {/* Before Image (Foreground, clipped by slider position) */}
      <div
        className="absolute top-0 left-0 bottom-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute top-0 left-0 max-w-none h-full object-contain pointer-events-none"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
          }}
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-md border border-slate-300 flex items-center justify-center">
          <ChevronsLeftRight className="w-4 h-4 text-slate-700" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/70 backdrop-blur text-white text-[11px] font-medium pointer-events-none">
        {beforeLabel}
      </div>
      <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-black/70 backdrop-blur text-white text-[11px] font-medium pointer-events-none">
        {afterLabel}
      </div>
    </div>
  );
};
