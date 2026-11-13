import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  filename?: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  filename = 'dsp_image.png',
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.3, 5.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.3, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60 text-white">
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-sky-400" />
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition ml-1"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/50 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div
          className="relative flex-1 overflow-hidden flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain transition-transform duration-75 pointer-events-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex justify-between">
          <span>Click & drag to pan around image. Use zoom controls to inspect pixel fidelity.</span>
          <span className="font-mono text-slate-400">Scale: {scale.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};
