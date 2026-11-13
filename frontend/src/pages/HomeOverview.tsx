import React from 'react';
import { 
  ArrowRight, 
  Layers, 
  Radio, 
  BarChart3, 
  Binary, 
  Sparkles, 
  Cpu, 
  HelpCircle, 
  CheckCircle, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface HomeOverviewProps {
  onStartExperiment: () => void;
  onExploreTheory: () => void;
  onSelectSample: (sampleId: string) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onStartExperiment,
  onExploreTheory,
  onSelectSample,
}) => {
  const pipelineSteps = [
    { number: '01', title: 'Original Image', desc: 'Clean 2-D reference signal I(x, y)', icon: Layers },
    { number: '02', title: 'Noise Addition', desc: 'Gaussian, Impulse, Speckle, or Periodic interference', icon: Binary },
    { number: '03', title: 'Filtering Pipeline', desc: 'Spatial kernels or 2-D Fourier transfer functions H(u, v)', icon: Radio },
    { number: '04', title: 'Reconstruction', desc: 'Spatial recovery / Inverse FFT IFFT2{G(u, v)}', icon: Cpu },
    { number: '05', title: 'Performance Evaluation', desc: 'Mathematical fidelity: MSE, PSNR, SSIM, Latency', icon: BarChart3 },
  ];

  const cards = [
    {
      title: 'Spatial Domain Processing',
      subtitle: 'Direct Pixel Manipulation',
      icon: Layers,
      color: 'sky',
      description: 'Operations applied directly to the image matrix coordinates (x, y) through 2-D discrete convolution. Features both linear averaging kernels and non-linear rank-order statistics.',
      algorithms: ['Mean (Box) Filter', 'Gaussian Weighted Filter', 'Median Rank-Order Filter', 'Bilateral Edge-Preserving Filter'],
    },
    {
      title: 'Frequency Domain Processing',
      subtitle: '2-D Fourier Spectrum Manipulation',
      icon: Radio,
      color: 'indigo',
      description: 'Transformation of spatial image data into spatial frequencies (u, v) using 2-D FFT. Denoising is achieved by attenuating noise frequencies via transfer function mask multiplication.',
      algorithms: ['2-D Fast Fourier Transform (FFT2)', 'Ideal Low-Pass Filter (ILPF)', 'Gaussian Low-Pass Filter (GLPF)', 'Butterworth Low-Pass & Notch Reject'],
    },
    {
      title: 'Noise Degradation Models',
      subtitle: 'Realistic Stochastic Perturbations',
      icon: Binary,
      color: 'emerald',
      description: 'Programmatic noise generation based on rigorous statistical physics models, reproducing sensor thermal noise, transmission dropouts, coherent speckle, and periodic grid interference.',
      algorithms: ['Additive White Gaussian Noise (AWGN)', 'Salt-and-Pepper (Impulse) Noise', 'Multiplicative Speckle Noise', '2-D Sinusoidal Periodic Noise'],
    },
    {
      title: 'Objective Quality Metrics',
      subtitle: 'Fidelity & Structural Evaluation',
      icon: BarChart3,
      color: 'amber',
      description: 'Quantitative mathematical assessment comparing denoised reconstructions against ground-truth clean references without subjective human bias.',
      algorithms: ['Mean Squared Error (MSE)', 'Peak Signal-to-Noise Ratio (PSNR dB)', 'Structural Similarity Index (SSIM)', 'Algorithm Execution Latency (ms)'],
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white via-sky-50/30 to-slate-50 border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic ECE / DSP Laboratory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight sm:leading-tight">
            DSP Image Lab
          </h1>
          <h2 className="text-xl sm:text-2xl font-medium text-slate-600 mt-2">
            Image Denoising Using 2-D Digital Signal Processing
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            A comprehensive, interactive scientific platform for studying image restoration. 
            Synthesize statistical and periodic noise models, design spatial and frequency-domain 
            filters (2-D FFT, Butterworth, Bilateral), and evaluate quantitative restoration fidelity 
            with real-time MSE, PSNR, and SSIM metrics.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartExperiment}
              className="px-6 py-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm shadow-sm hover:shadow transition flex items-center gap-2 group cursor-pointer"
            >
              <span>Start Experiment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreTheory}
              className="px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 shadow-2xs hover:border-slate-300 transition flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Explore DSP Concepts</span>
            </button>
          </div>

          {/* Quick preset loaders */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Quick Test Benchmarks:</span>
            {[
              { id: 'cameraman', label: 'Cameraman (Grayscale)' },
              { id: 'geometric_pattern', label: 'Siemens Star (Chirp)' },
              { id: 'astronaut', label: 'Astronaut (Color RGB)' },
              { id: 'coins', label: 'Coins (Contrast)' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectSample(preset.id)}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition shadow-2xs font-mono text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Processing Pipeline */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Visual DSP Processing Pipeline</h3>
          <p className="text-sm text-slate-500 mt-1">
            End-to-end signal flow from raw sensory degradation to objective fidelity evaluation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center p-4 rounded-xl bg-slate-50/60 border border-slate-200/80">
                <div className="w-10 h-10 rounded-full bg-white text-sky-800 border border-slate-200 flex items-center justify-center font-mono font-bold text-sm shadow-2xs mb-3">
                  <Icon className="w-5 h-5 text-sky-700" />
                </div>
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Step {step.number}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                {idx < 4 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Domain Concept Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">{card.title}</h3>
                    <span className="text-xs text-slate-500">{card.subtitle}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Key Implementations
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 font-mono">
                  {card.algorithms.map((algo) => (
                    <li key={algo} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span className="truncate">{algo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* Theory & Mathematical Foundations Highlights */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Foundational DSP Concepts & Mathematics</h3>
            <p className="text-xs text-slate-500">Rigorous mathematical formulations governing 2-D image filtering</p>
          </div>
          <button
            onClick={onExploreTheory}
            className="text-xs font-medium text-sky-700 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Read Complete Theory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2-D Spatial Convolution */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">2-D Spatial Convolution</h4>
            <div className="bg-white p-2.5 rounded font-mono text-xs text-sky-900 border border-slate-200 my-2 overflow-x-auto">
              g(x,y) = ∑∑ f(m,n) · h(x-m, y-n)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spatial filtering replaces each pixel with a weighted combination of neighboring pixels defined by kernel h.
            </p>
          </div>

          {/* 2-D Discrete Fourier Transform */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">2-D Discrete Fourier Transform</h4>
            <div className="bg-white p-2.5 rounded font-mono text-xs text-sky-900 border border-slate-200 my-2 overflow-x-auto">
              F(u,v) = ∑∑ f(x,y) · e^[-j2π(ux/M + vy/N)]
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decomposes the image into orthogonal sinusoidal basis functions. Filtering simplifies to point-wise multiplication G = F · H.
            </p>
          </div>

          {/* PSNR & SSIM */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">PSNR & SSIM Metrics</h4>
            <div className="bg-white p-2.5 rounded font-mono text-xs text-sky-900 border border-slate-200 my-2 overflow-x-auto">
              PSNR = 10 · log₁₀(255² / MSE)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              PSNR quantifies logarithmic power ratio in decibels (dB), while SSIM evaluates luminance, contrast, and structural correlation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
