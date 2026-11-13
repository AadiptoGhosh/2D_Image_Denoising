import React, { useState } from 'react';
import { 
  Layers, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ImageSession, SpatialFilterParams, SpatialFilterType } from '../types/dsp';
import { ImageCard } from '../components/ImageCard';
import { MetricBadge } from '../components/MetricBadge';

interface SpatialFilteringProps {
  session: ImageSession | null;
  onApplySpatialFilter: (params: Partial<SpatialFilterParams>) => Promise<void>;
  onNavigateToAnalysis: () => void;
  isLoading: boolean;
}

export const SpatialFiltering: React.FC<SpatialFilteringProps> = ({
  session,
  onApplySpatialFilter,
  onNavigateToAnalysis,
  isLoading,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<SpatialFilterType>('median');

  // Mean params
  const [meanKernel, setMeanKernel] = useState<number>(3);

  // Gaussian params
  const [gaussKernel, setGaussKernel] = useState<number>(5);
  const [gaussSigma, setGaussSigma] = useState<number>(1.2);

  // Median params
  const [medianKernel, setMedianKernel] = useState<number>(3);

  // Bilateral params
  const [bilateralDiameter, setBilateralDiameter] = useState<number>(9);
  const [bilateralSigmaColor, setBilateralSigmaColor] = useState<number>(75.0);
  const [bilateralSigmaSpace, setBilateralSigmaSpace] = useState<number>(75.0);

  const handleApplyFilter = () => {
    const params: Partial<SpatialFilterParams> = {
      filter_name: selectedFilter,
    };

    if (selectedFilter === 'mean') {
      params.kernel_size = meanKernel;
    } else if (selectedFilter === 'gaussian') {
      params.kernel_size = gaussKernel;
      params.sigma = gaussSigma;
    } else if (selectedFilter === 'median') {
      params.kernel_size = medianKernel;
    } else if (selectedFilter === 'bilateral') {
      params.diameter = bilateralDiameter;
      params.sigma_color = bilateralSigmaColor;
      params.sigma_space = bilateralSigmaSpace;
    }

    onApplySpatialFilter(params);
  };

  if (!session) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Active Image Loaded</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please upload or select an image in the Image Processing Lab before applying spatial filtering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Spatial Domain Filtering</h2>
          <p className="text-sm text-slate-500">
            Convolve discrete 2-D spatial kernels directly over pixel neighborhoods to suppress noise.
          </p>
        </div>

        <button
          onClick={onNavigateToAnalysis}
          className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>View Performance Benchmark</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Main Filtering Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Filter Controls (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Select Spatial Algorithm
            </h3>

            {/* Algorithm Select Cards */}
            <div className="space-y-2">
              {[
                {
                  id: 'mean',
                  name: 'Mean (Box) Filter',
                  type: 'Linear Spatial Filter',
                  desc: 'Replaces pixel with arithmetic average of neighborhood. Effective on Gaussian noise, but blurs sharp edges.',
                },
                {
                  id: 'gaussian',
                  name: 'Gaussian Filter',
                  type: 'Linear Weighted Filter',
                  desc: 'Weights neighbors by 2-D Gaussian probability distribution. Smooths without introducing square block artifacts.',
                },
                {
                  id: 'median',
                  name: 'Median Filter',
                  type: 'Non-linear Rank-Order',
                  desc: 'Selects the statistical median value. Unrivaled for suppressing Salt-and-Pepper impulse spikes while preserving edges.',
                },
                {
                  id: 'bilateral',
                  name: 'Bilateral Filter',
                  type: 'Non-linear Edge-Preserving',
                  desc: 'Combines geometric distance and radiometric color distance. Smooths textures while strictly preserving sharp boundaries.',
                },
              ].map((filter) => (
                <div
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id as SpatialFilterType)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition ${
                    selectedFilter === filter.id
                      ? 'border-sky-500 bg-sky-50/70 shadow-2xs ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">{filter.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {filter.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{filter.desc}</p>
                </div>
              ))}
            </div>

            {/* Algorithm Parameters */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Parameter Tuning
              </h4>

              {/* Mean Filter Controls */}
              {selectedFilter === 'mean' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-700">
                    Kernel Window Size (K × K)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 7].map((k) => (
                      <button
                        key={k}
                        onClick={() => setMeanKernel(k)}
                        className={`py-2 text-xs font-mono font-semibold rounded border transition ${
                          meanKernel === k
                            ? 'bg-sky-700 text-white border-sky-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {k} × {k}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Larger kernels yield stronger noise smoothing at the cost of noticeable edge blur.
                  </p>
                </div>
              )}

              {/* Gaussian Filter Controls */}
              {selectedFilter === 'gaussian' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Kernel Size
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 5, 7, 9].map((k) => (
                        <button
                          key={k}
                          onClick={() => setGaussKernel(k)}
                          className={`py-1.5 text-xs font-mono font-semibold rounded border transition ${
                            gaussKernel === k
                              ? 'bg-sky-700 text-white border-sky-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {k}×{k}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Spatial Standard Deviation (σ)</span>
                      <span className="font-mono">{gaussSigma.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="5.0"
                      step="0.1"
                      value={gaussSigma}
                      onChange={(e) => setGaussSigma(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Determines the Gaussian distribution width in the spatial domain
                    </div>
                  </div>
                </div>
              )}

              {/* Median Filter Controls */}
              {selectedFilter === 'median' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-700">
                    Rank-Order Neighborhood (K × K)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 7].map((k) => (
                      <button
                        key={k}
                        onClick={() => setMedianKernel(k)}
                        className={`py-2 text-xs font-mono font-semibold rounded border transition ${
                          medianKernel === k
                            ? 'bg-sky-700 text-white border-sky-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {k} × {k}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Median filtering is an order-statistic operation; non-linear properties prevent impulse smearing.
                  </p>
                </div>
              )}

              {/* Bilateral Filter Controls */}
              {selectedFilter === 'bilateral' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Pixel Neighborhood Diameter (d)</span>
                      <span className="font-mono">{bilateralDiameter} px</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="2"
                      value={bilateralDiameter}
                      onChange={(e) => setBilateralDiameter(parseInt(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Sigma Color (Radiometric / Range)</span>
                      <span className="font-mono">{bilateralSigmaColor.toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={bilateralSigmaColor}
                      onChange={(e) => setBilateralSigmaColor(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Threshold of intensity difference considered an edge boundary
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Sigma Space (Coordinate / Domain)</span>
                      <span className="font-mono">{bilateralSigmaSpace.toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={bilateralSigmaSpace}
                      onChange={(e) => setBilateralSigmaSpace(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Spatial Euclidean distance weighting factor
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <button
              onClick={handleApplyFilter}
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Spatial Convolution in Python...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Spatial Filter</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Image Viewers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Noisy Image */}
            <ImageCard
              title="Input Noisy Image"
              subtitle="Signal currently undergoing filtering"
              imageUrl={session.noisy_image}
              dimensions={session.dimensions}
              channels={session.channels}
              badgeText="Input"
              badgeColor="amber"
              downloadFilename={`input_noisy_${session.filename}`}
            />

            {/* Filtered Denoised Output */}
            <ImageCard
              title="Filtered Image Output"
              subtitle={session.last_filtered_image ? 'Spatial filter result' : 'Awaiting execution'}
              imageUrl={session.last_filtered_image || session.noisy_image}
              compareImageUrl={session.noisy_image}
              compareLabel="Noisy Input"
              dimensions={session.dimensions}
              channels={session.channels}
              metrics={session.last_filtered_image ? session.metrics : undefined}
              badgeText="Filtered Result"
              badgeColor="emerald"
              downloadFilename={`spatial_filtered_${session.filename}`}
            />
          </div>

          {/* Mathematical Insights Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-700" />
              <span>DSP Theoretical Note on Spatial Filtering</span>
            </h4>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                Spatial domain filtering performs neighborhood averaging via 2-D discrete convolution. 
                For linear filters, the frequency response is low-pass: high-frequency details (both noise and sharp edges) 
                are attenuated.
              </p>
              <p>
                To avoid blurring edges, non-linear alternatives like the <strong>Median Filter</strong> (which sorts pixel values and selects the 50th percentile) 
                or the <strong>Bilateral Filter</strong> (which weights pixel contributions by photometric similarity) are employed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
