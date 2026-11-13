import React, { useState } from 'react';
import { Download, Maximize2, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { Metrics } from '../types/dsp';
import { MetricBadge } from './MetricBadge';
import { ImageZoomModal } from './ImageZoomModal';
import { ImageComparisonSlider } from './ImageComparisonSlider';

interface ImageCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  compareImageUrl?: string;
  compareLabel?: string;
  dimensions?: string;
  channels?: number;
  metrics?: Metrics;
  downloadFilename?: string;
  badgeText?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'slate';
}

export const ImageCard: React.FC<ImageCardProps> = ({
  title,
  subtitle,
  imageUrl,
  compareImageUrl,
  compareLabel = 'Original Reference',
  dimensions,
  channels,
  metrics,
  downloadFilename = 'processed_image.png',
  badgeText,
  badgeColor = 'blue',
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'slate':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden transition-all hover:border-slate-300 hover:shadow-sm">
        {/* Card Header */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
              {badgeText && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getBadgeClasses()}`}>
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {compareImageUrl && (
              <button
                onClick={() => setShowSlider(!showSlider)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition ${
                  showSlider
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                }`}
                title="Toggle Before/After Comparison Slider"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-medium">Compare</span>
              </button>
            )}

            <button
              onClick={() => setIsZoomOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-md transition"
              title="Full Zoom & Pan Preview"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-md transition"
              title="Download Image"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="relative flex-1 min-h-[260px] bg-slate-900/5 flex items-center justify-center p-3 overflow-hidden">
          {showSlider && compareImageUrl ? (
            <ImageComparisonSlider
              beforeImage={compareImageUrl}
              afterImage={imageUrl}
              beforeLabel={compareLabel}
              afterLabel={title}
            />
          ) : (
            <div className="relative group max-h-[360px] flex items-center justify-center">
              <img
                src={imageUrl}
                alt={title}
                className="max-h-[340px] w-auto max-w-full object-contain rounded-md shadow-2xs border border-slate-200/60 bg-white"
              />
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white rounded-md backdrop-blur-2xs cursor-zoom-in"
              >
                <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-xs font-medium flex items-center gap-1.5 border border-slate-700">
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  Click to Zoom & Pan
                </span>
              </button>
            </div>
          )}

          {/* Dimensions tag */}
          {dimensions && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/70 text-white font-mono text-[10px] backdrop-blur-xs flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-slate-300" />
              <span>{dimensions}</span>
              {channels && <span>({channels === 1 ? 'Grayscale' : `${channels}-Ch RGB`})</span>}
            </div>
          )}
        </div>

        {/* Metrics Footer */}
        {metrics && (
          <div className="p-3 bg-white border-t border-slate-100">
            <MetricBadge metrics={metrics} />
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={imageUrl}
        title={title}
        subtitle={subtitle}
        filename={downloadFilename}
      />
    </>
  );
};
