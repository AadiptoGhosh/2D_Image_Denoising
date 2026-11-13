import React, { useState } from 'react';
import { 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Radio, 
  FileImage, 
  Sliders, 
  Hash, 
  AlertTriangle, 
  Check, 
  RefreshCw,
  Binary
} from 'lucide-react';
import { ImageSession, NoiseParams, SampleImage, NoiseType } from '../types/dsp';
import { ImageCard } from '../components/ImageCard';

interface ImageLabProps {
  session: ImageSession | null;
  samples: SampleImage[];
  onUpload: (file: File) => Promise<void>;
  onLoadSample: (sampleId: string) => Promise<void>;
  onApplyNoise: (params: Partial<NoiseParams>) => Promise<void>;
  onReset: () => Promise<void>;
  onNavigateToSpatial: () => void;
  onNavigateToFrequency: () => void;
  isLoading: boolean;
}

export const ImageLab: React.FC<ImageLabProps> = ({
  session,
  samples,
  onUpload,
  onLoadSample,
  onApplyNoise,
  onReset,
  onNavigateToSpatial,
  onNavigateToFrequency,
  isLoading,
}) => {
  // Noise controls state
  const [selectedNoise, setSelectedNoise] = useState<NoiseType>('gaussian');
  
  // Gaussian params
  const [mean, setMean] = useState<number>(0.0);
  const [sigma, setSigma] = useState<number>(25.0);
  const [intensity, setIntensity] = useState<number>(1.0);

  // Salt & Pepper params
  const [density, setDensity] = useState<number>(0.05);
  const [saltRatio, setSaltRatio] = useState<number>(0.5);

  // Speckle params
  const [variance, setVariance] = useState<number>(0.05);

  // Periodic params
  const [frequency, setFrequency] = useState<number>(15.0);
  const [amplitude, setAmplitude] = useState<number>(35.0);
  const [angleDegrees, setAngleDegrees] = useState<number>(45.0);

  // Fixed Random Seed toggle
  const [useFixedSeed, setUseFixedSeed] = useState<boolean>(true);
  const [seedValue, setSeedValue] = useState<number>(42);

  // File drag & drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileValidationAndUpload = async (file: File) => {
    setUploadError(null);
    const validExtensions = ['png', 'jpg', 'jpeg', 'bmp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      setUploadError(`Invalid file format '.${ext}'. Supported: PNG, JPG, JPEG, BMP`);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds the 15 MB limit.');
      return;
    }
    await onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidationAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyNoiseClick = () => {
    const params: Partial<NoiseParams> = {
      noise_type: selectedNoise,
      seed: useFixedSeed ? seedValue : null,
    };

    if (selectedNoise === 'gaussian') {
      params.mean = mean;
      params.sigma = sigma;
      params.intensity = intensity;
    } else if (selectedNoise === 'salt_and_pepper') {
      params.density = density;
      params.salt_ratio = saltRatio;
    } else if (selectedNoise === 'speckle') {
      params.variance = variance;
    } else if (selectedNoise === 'periodic') {
      params.frequency = frequency;
      params.amplitude = amplitude;
      params.angle_degrees = angleDegrees;
    }

    onApplyNoise(params);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Image Processing Lab</h2>
          <p className="text-sm text-slate-500">
            Upload images or select academic benchmarks, introduce controlled statistical noise, and inspect results.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          {session && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Clean Original</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Section: Upload & Academic Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDrop}
          className={`lg:col-span-2 relative p-6 rounded-xl border-2 border-dashed transition-all bg-white flex flex-col items-center justify-center text-center ${
            isDraggingFile
              ? 'border-sky-500 bg-sky-50/50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Upload Custom Image for Denoising Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Drag & drop your file here, or browse. Valid formats: <span className="font-mono font-medium">PNG, JPG, JPEG, BMP</span> (max 15MB).
          </p>

          <label className="mt-4 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-2xs cursor-pointer transition flex items-center gap-2">
            <FileImage className="w-3.5 h-3.5" />
            <span>Select Local Image</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.bmp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileValidationAndUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {uploadError && (
            <div className="mt-3 p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Built-in Academic Presets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-sky-50 text-sky-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Academic DSP Benchmarks</h4>
                <p className="text-[11px] text-slate-500">Standard test images used in peer-reviewed literature</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'cameraman', name: 'Cameraman (Grayscale)', desc: 'Sharp edges & coats' },
                { id: 'geometric_pattern', name: 'Siemens Star (Chirp)', desc: 'Radial frequencies' },
                { id: 'astronaut', name: 'Astronaut (RGB Color)', desc: 'High dynamic range' },
                { id: 'coins', name: 'Coins (High Contrast)', desc: 'Boundary circles' },
                { id: 'synthetic_scene', name: 'Synthetic Lab Scene', desc: 'Grids & gradients' },
              ].map((bench) => (
                <button
                  key={bench.id}
                  onClick={() => onLoadSample(bench.id)}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-100 hover:border-sky-300 hover:bg-sky-50/60 transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-800">
                      {bench.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{bench.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-800">
                    Load
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Image Comparison Section */}
      {session && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Tri-State Image Comparison</span>
              <span className="text-xs font-normal text-slate-500">
                (Original Clean vs Noisy State vs Denoised Output)
              </span>
            </h3>

            {/* Quick jump actions to filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToSpatial}
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Filter in Spatial Domain</span>
              </button>
              <button
                onClick={onNavigateToFrequency}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter in Frequency Domain</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Original Image */}
            <ImageCard
              title="1. Original Clean Image"
              subtitle="Ground-truth reference signal"
              imageUrl={session.original_image}
              dimensions={session.dimensions}
              channels={session.channels}
              badgeText="Reference"
              badgeColor="emerald"
              downloadFilename={`clean_${session.filename}`}
            />

            {/* 2. Noisy Image */}
            <ImageCard
              title="2. Degraded / Noisy Image"
              subtitle={`Perturbed with ${session.noisy_image ? 'selected noise model' : 'noise'}`}
              imageUrl={session.noisy_image}
              compareImageUrl={session.original_image}
              compareLabel="Original"
              dimensions={session.dimensions}
              channels={session.channels}
              metrics={session.metrics}
              badgeText="Degraded"
              badgeColor="amber"
              downloadFilename={`noisy_${session.filename}`}
            />

            {/* 3. Denoised Image */}
            <ImageCard
              title="3. Denoised Image"
              subtitle={session.last_filtered_image ? 'Restored by DSP algorithm' : 'Awaiting filter application'}
              imageUrl={session.last_filtered_image || session.noisy_image}
              compareImageUrl={session.noisy_image}
              compareLabel="Noisy"
              dimensions={session.dimensions}
              channels={session.channels}
              badgeText={session.last_filtered_image ? 'Filtered' : 'Pending'}
              badgeColor="blue"
              downloadFilename={`denoised_${session.filename}`}
            />
          </div>
        </section>
      )}

      {/* Noise Generation Control Panel */}
      {session && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Binary className="w-5 h-5 text-sky-700" />
                <span>Stochastic & Deterministic Noise Generator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Programmatic NumPy noise generation with reproducible random seed controls
              </p>
            </div>

            {/* Seed reproducibility toggle */}
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useFixedSeed}
                  onChange={(e) => setUseFixedSeed(e.target.checked)}
                  className="rounded border-slate-300 text-sky-700 focus:ring-sky-500"
                />
                <span className="font-medium text-slate-700">Fixed Random Seed</span>
              </label>

              {useFixedSeed && (
                <div className="flex items-center gap-1 font-mono">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    value={seedValue}
                    onChange={(e) => setSeedValue(parseInt(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 rounded border border-slate-300 bg-white text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Noise Type Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'gaussian', label: 'Gaussian Noise', desc: 'Additive White Gaussian (AWGN)' },
              { id: 'salt_and_pepper', label: 'Salt & Pepper', desc: 'Impulse / Bit-error noise' },
              { id: 'speckle', label: 'Speckle Noise', desc: 'Multiplicative radar noise' },
              { id: 'periodic', label: 'Periodic Noise', desc: '2-D Sinusoidal interference' },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNoise(n.id as NoiseType)}
                className={`p-3 rounded-lg border text-left transition ${
                  selectedNoise === n.id
                    ? 'border-sky-500 bg-sky-50/70 shadow-2xs text-sky-950 ring-1 ring-sky-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-semibold text-xs">{n.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{n.desc}</div>
              </button>
            ))}
          </div>

          {/* Dynamic Parameters Based on Selected Noise */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/80">
            {selectedNoise === 'gaussian' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Gaussian Distribution Parameters: I_noisy = clip(I + N(μ, σ²), 0, 255)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Mean */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Mean (μ)</span>
                      <span className="font-mono">{mean.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={mean}
                      onChange={(e) => setMean(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Offset mean value</div>
                  </div>

                  {/* Sigma / Standard Deviation */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Standard Deviation (σ)</span>
                      <span className="font-mono">{sigma.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={sigma}
                      onChange={(e) => setSigma(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Noise amplitude spread</div>
                  </div>

                  {/* Intensity */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Noise Scaling Factor</span>
                      <span className="font-mono">{intensity.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={intensity}
                      onChange={(e) => setIntensity(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Overall gain multiplier</div>
                  </div>
                </div>
              </div>
            )}

            {selectedNoise === 'salt_and_pepper' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Impulse Noise Parameters (Random Bipolar Extremes)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Density */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Noise Density (Corrupted Pixels)</span>
                      <span className="font-mono">{(density * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.4"
                      step="0.01"
                      value={density}
                      onChange={(e) => setDensity(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Percentage of image pixels corrupted</div>
                  </div>

                  {/* Salt vs Pepper Ratio */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Salt vs Pepper Ratio</span>
                      <span className="font-mono">Salt: {(saltRatio * 100).toFixed(0)}% | Pepper: {((1 - saltRatio) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={saltRatio}
                      onChange={(e) => setSaltRatio(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Proportion of white (255) vs black (0) spikes</div>
                  </div>
                </div>
              </div>
            )}

            {selectedNoise === 'speckle' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Speckle Noise: Multiplicative Variance I_noisy = I + I · N(0, σ²)
                </div>
                <div className="max-w-md">
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Noise Variance (σ²)</span>
                    <span className="font-mono">{variance.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={variance}
                    onChange={(e) => setVariance(parseFloat(e.target.value))}
                    className="w-full accent-sky-700"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">Signal-dependent variance parameter</div>
                </div>
              </div>
            )}

            {selectedNoise === 'periodic' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  2-D Sinusoidal Interference: I_noisy = I + A · sin(2π(u₀x/M + v₀y/N))
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Spatial Frequency */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Spatial Frequency</span>
                      <span className="font-mono">{frequency.toFixed(0)} cycles</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="60"
                      step="1"
                      value={frequency}
                      onChange={(e) => setFrequency(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Harmonic frequency across spatial dimensions</div>
                  </div>

                  {/* Amplitude */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Wave Amplitude (A)</span>
                      <span className="font-mono">{amplitude.toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={amplitude}
                      onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Intensity magnitude of interference stripes</div>
                  </div>

                  {/* Direction Angle */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Direction Angle</span>
                      <span className="font-mono">{angleDegrees.toFixed(0)}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="5"
                      value={angleDegrees}
                      onChange={(e) => setAngleDegrees(parseFloat(e.target.value))}
                      className="w-full accent-sky-700"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">Wave propagation orientation</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button: Apply Noise */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              Selected: <span className="font-semibold text-slate-800 capitalize">{selectedNoise.replace('_', ' ')}</span>
            </div>

            <button
              onClick={handleApplyNoiseClick}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Synthetic Noise...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Noise to Image</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
