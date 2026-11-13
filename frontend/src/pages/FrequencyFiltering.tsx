import React, { useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  RefreshCw, 
  Info, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  Eye,
  Sliders,
  Maximize2,
  Crosshair
} from 'lucide-react';
import { 
  ImageSession, 
  FrequencyFilterParams, 
  FrequencyFilterType, 
  FrequencyFilterResponse 
} from '../types/dsp';
import { ImageCard } from '../components/ImageCard';
import { MetricBadge } from '../components/MetricBadge';

interface FrequencyFilteringProps {
  session: ImageSession | null;
  onApplyFrequencyFilter: (params: Partial<FrequencyFilterParams>) => Promise<FrequencyFilterResponse | null>;
  frequencyResult: FrequencyFilterResponse | null;
  onNavigateToAnalysis: () => void;
  isLoading: boolean;
}

export const FrequencyFiltering: React.FC<FrequencyFilteringProps> = ({
  session,
  onApplyFrequencyFilter,
  frequencyResult,
  onNavigateToAnalysis,
  isLoading,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FrequencyFilterType>('butterworth');
  const [cutoff, setCutoff] = useState<number>(45.0);
  const [order, setOrder] = useState<number>(2);

  // Notch filter parameters
  const [notchU, setNotchU] = useState<number>(15.0);
  const [notchV, setNotchV] = useState<number>(15.0);
  const [notchRadius, setNotchRadius] = useState<number>(12.0);

  const handleApply = () => {
    const params: Partial<FrequencyFilterParams> = {
      filter_name: selectedFilter,
      cutoff: cutoff,
      order: order,
    };

    if (selectedFilter === 'notch') {
      params.notches = [{ u: notchU, v: notchV, radius: notchRadius }];
    }

    onApplyFrequencyFilter(params);
  };

  if (!session) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Active Image Loaded</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please upload or select an image in the Image Processing Lab before applying frequency-domain filtering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Frequency Domain Filtering (2-D DSP)</h2>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
              FFT2 / IFFT2
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Transform spatial data to 2-D Fourier spectrum, apply frequency transfer masks H(u,v), and synthesize back to spatial domain.
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

      {/* Control Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Filter Selection & Frequency Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select 2-D transfer function mask and adjust spatial cutoff radius D₀
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Spectrum Formula: <span className="font-semibold text-sky-800">20·log₁₀(1 + |F(u,v)|)</span>
          </div>
        </div>

        {/* Filter Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'ideal',
              name: 'Ideal LPF (ILPF)',
              tag: 'Sharp Cutoff',
              desc: 'Hard binary threshold at D0. Demonstrates Gibbs phenomenon (pronounced ringing ripples) in spatial reconstruction.',
            },
            {
              id: 'gaussian',
              name: 'Gaussian LPF (GLPF)',
              tag: 'Zero Ringing',
              desc: 'Completely smooth exponential frequency falloff. Never introduces spatial ringing artifacts around sharp edges.',
            },
            {
              id: 'butterworth',
              name: 'Butterworth LPF (BLPF)',
              tag: 'Maximally Flat',
              desc: 'Controlled transition steepness governed by order n. Smoothly bridges the gap between Ideal and Gaussian responses.',
            },
            {
              id: 'notch',
              name: 'Notch Reject Filter (NRF)',
              tag: 'Periodic Noise Attenuator',
              desc: 'Attenuates discrete conjugate frequency spikes (u₀, v₀) to remove sinusoidal stripes without blurring image details.',
            },
          ].map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFilter(f.id as FrequencyFilterType)}
              className={`p-3.5 rounded-lg border cursor-pointer transition ${
                selectedFilter === f.id
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500 text-indigo-950'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">{f.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {f.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Parameter Sliders */}
        <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/80">
          {selectedFilter !== 'notch' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cutoff frequency D0 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Cutoff Frequency Radius (D₀)</span>
                  <span className="font-mono text-indigo-700 font-bold">{cutoff} px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="1"
                  value={cutoff}
                  onChange={(e) => setCutoff(parseFloat(e.target.value))}
                  className="w-full accent-indigo-700"
                />
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Distance from zero-frequency center where H(u,v) drops
                </div>
              </div>

              {/* Butterworth Order */}
              {selectedFilter === 'butterworth' ? (
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Butterworth Filter Order (n)</span>
                    <span className="font-mono text-indigo-700 font-bold">n = {order}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value))}
                    className="w-full accent-indigo-700"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Higher order approximates Ideal LPF; lower order approaches Gaussian LPF
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-xs text-slate-500 p-2 bg-white rounded border border-slate-200">
                  <Info className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>
                    {selectedFilter === 'ideal' 
                      ? 'Ideal LPF has a discontinuous cutoff gradient; inspect output for ringing ripples.' 
                      : 'Gaussian LPF has an infinitely differentiable smooth transition; zero ringing.'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Notch Filter Controls */
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                <span>Notch Reject Coordinates & Radius</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Notch Frequency U (u₀)</span>
                    <span className="font-mono text-indigo-700 font-bold">{notchU}</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="1"
                    value={notchU}
                    onChange={(e) => setNotchU(parseFloat(e.target.value))}
                    className="w-full accent-indigo-700"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">Horizontal frequency offset from DC</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Notch Frequency V (v₀)</span>
                    <span className="font-mono text-indigo-700 font-bold">{notchV}</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="1"
                    value={notchV}
                    onChange={(e) => setNotchV(parseFloat(e.target.value))}
                    className="w-full accent-indigo-700"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">Vertical frequency offset from DC</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Notch Rejection Radius (D₀)</span>
                    <span className="font-mono text-indigo-700 font-bold">{notchRadius} px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={notchRadius}
                    onChange={(e) => setNotchRadius(parseFloat(e.target.value))}
                    className="w-full accent-indigo-700"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">Radius of the notch hole in frequency plane</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Execute Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Selected Transfer Function:{' '}
            <span className="font-semibold text-slate-800 capitalize">
              {selectedFilter.replace('_', ' ')} Filter
            </span>
          </div>

          <button
            onClick={handleApply}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing 2-D FFT & Frequency Filtering...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute 2-D Frequency Filter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5-Stage Visualization Pipeline */}
      {frequencyResult && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Complete 5-Stage Frequency Domain Transformation Gallery</span>
              </h3>
              <p className="text-xs text-slate-500">
                Logarithmic magnitude spectra computed via 20·log₁₀(1 + |F(u,v)|)
              </p>
            </div>
            <MetricBadge metrics={frequencyResult.metrics} compact />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Stage 1: Input Image */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                1. Input Noisy Signal
              </div>
              <div className="flex-1 bg-slate-900/10 rounded-lg flex items-center justify-center p-2 min-h-[160px]">
                <img
                  src={session.noisy_image}
                  alt="Noisy Input"
                  className="max-h-[160px] w-auto max-w-full object-contain rounded"
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-2">Spatial domain f(x, y)</div>
            </div>

            {/* Stage 2: Input Spectrum */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                2. Input FFT Spectrum
              </div>
              <div className="flex-1 bg-slate-950 rounded-lg flex items-center justify-center p-2 min-h-[160px]">
                <img
                  src={frequencyResult.input_spectrum}
                  alt="Input Spectrum"
                  className="max-h-[160px] w-auto max-w-full object-contain rounded"
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-2">F(u, v) with DC at center</div>
            </div>

            {/* Stage 3: Filter Mask */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                3. Filter Mask H(u, v)
              </div>
              <div className="flex-1 bg-slate-950 rounded-lg flex items-center justify-center p-2 min-h-[160px]">
                <img
                  src={frequencyResult.filter_mask}
                  alt="Filter Mask"
                  className="max-h-[160px] w-auto max-w-full object-contain rounded"
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-2">Transfer function (White = Pass)</div>
            </div>

            {/* Stage 4: Filtered Spectrum */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                4. Filtered Spectrum
              </div>
              <div className="flex-1 bg-slate-950 rounded-lg flex items-center justify-center p-2 min-h-[160px]">
                <img
                  src={frequencyResult.filtered_spectrum}
                  alt="Filtered Spectrum"
                  className="max-h-[160px] w-auto max-w-full object-contain rounded"
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-2">G(u, v) = F(u, v) · H(u, v)</div>
            </div>

            {/* Stage 5: Reconstructed Image */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                5. Reconstructed Signal
              </div>
              <div className="flex-1 bg-slate-900/10 rounded-lg flex items-center justify-center p-2 min-h-[160px]">
                <img
                  src={frequencyResult.filtered_image}
                  alt="Reconstructed Denoised"
                  className="max-h-[160px] w-auto max-w-full object-contain rounded"
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-2">IFFT2{'{'}G(u, v){'}'} real part</div>
            </div>
          </div>

          {/* Large Image Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <ImageCard
              title="Noisy Input Image"
              subtitle="Signal before 2-D Fourier processing"
              imageUrl={session.noisy_image}
              dimensions={session.dimensions}
              channels={session.channels}
              badgeText="Input"
              badgeColor="amber"
              downloadFilename={`frequency_input_${session.filename}`}
            />

            <ImageCard
              title="Denoised Spatial Reconstruction"
              subtitle={`Restored by ${frequencyResult.filter_params?.filter_name || 'Frequency Filter'}`}
              imageUrl={frequencyResult.filtered_image}
              compareImageUrl={session.noisy_image}
              compareLabel="Noisy Input"
              dimensions={session.dimensions}
              channels={session.channels}
              metrics={frequencyResult.metrics}
              badgeText="Restored"
              badgeColor="emerald"
              downloadFilename={`frequency_denoised_${session.filename}`}
            />
          </div>
        </section>
      )}

      {/* DSP Theory Note on Gibbs Ringing & Notch Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-700" />
          <span>Understanding Frequency Domain Characteristics</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Gibbs Phenomenon (Ideal LPF)</span>
            The discontinuous box transition in the frequency domain transforms via inverse Fourier transform 
            into a 2-D sinc function in the spatial domain. The side lobes of this sinc function cause ripple oscillations 
            (ringing) around edges.
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Gaussian Smoothness (GLPF)</span>
            The Fourier transform of a 2-D Gaussian is also a Gaussian. Because a Gaussian has no side lobes or discontinuities, 
            it completely avoids ringing artifacts in spatial reconstructions.
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Notch Filter for Periodic Stripes</span>
            Sinusoidal interference creates discrete point spikes in the Fourier magnitude spectrum. 
            By placing narrow notch zeroes at these precise coordinates and their symmetric conjugates, 
            the periodic noise is removed without degrading broad structural frequencies.
          </div>
        </div>
      </div>
    </div>
  );
};
