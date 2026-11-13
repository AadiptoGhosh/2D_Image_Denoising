import React from 'react';
import { 
  BookOpen, 
  Binary, 
  Layers, 
  Radio, 
  Cpu, 
  CheckCircle2, 
  GraduationCap, 
  ExternalLink,
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const AboutTheory: React.FC = () => {
  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-sky-200">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>ECE / Digital Signal Processing Curriculum</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          DSP Theory & Mathematical Foundations
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Comprehensive reference on 2-D discrete signal transforms, stochastic degradation models, and restoration filters.
        </p>
      </div>

      {/* College Project Evaluation / Viva Guide */}
      <section className="bg-gradient-to-br from-sky-50/50 via-white to-slate-50 rounded-xl border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sky-900 font-bold text-base">
          <Compass className="w-5 h-5 text-sky-700" />
          <h3>Academic Demonstration Walkthrough (Viva / Evaluation Guide)</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Demonstrate these 4 experimental scenarios during college project defense to highlight the theoretical differences between spatial and frequency domain operations:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Demo 1 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Salt & Pepper vs. Median Filter</span>
            </div>
            <p className="text-slate-600">
              Apply 5% Salt & Pepper noise in the Lab. In Spatial Filtering, compare <strong>Mean Filter</strong> vs <strong>Median Filter</strong>. 
              Explain to the examiner that linear averaging smears bipolar impulses (creating blurry gray spots), whereas the non-linear rank-order 
              median completely purges extreme outliers.
            </p>
          </div>

          {/* Demo 2 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Gaussian Noise vs. Bilateral Filter</span>
            </div>
            <p className="text-slate-600">
              Apply Gaussian noise (σ=25). Test <strong>Gaussian Filter</strong> vs <strong>Bilateral Filter</strong>. 
              Show that while the Gaussian filter blurs high-frequency boundaries, the Bilateral filter preserves sharp edge contrasts 
              because radiometric weights drop when intensity differences exceed σ_color.
            </p>
          </div>

          {/* Demo 3 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Periodic Noise vs. 2-D FFT Notch Filter</span>
            </div>
            <p className="text-slate-600">
              Apply Periodic Noise (Frequency=15, Angle=45°). In Frequency Filtering, inspect the 2-D Fourier spectrum. 
              Point out the bright symmetric harmonic spikes. Select <strong>Notch Reject Filter</strong> at (u₀=11, v₀=11) to excise the spikes. 
              Show that the stripes vanish while retaining pristine original resolution!
            </p>
          </div>

          {/* Demo 4 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] flex items-center justify-center font-bold">4</span>
              <span>Gibbs Ringing Phenomenon (ILPF vs GLPF)</span>
            </div>
            <p className="text-slate-600">
              Apply <strong>Ideal Low-Pass Filter</strong> with D₀=30. Point out the ripple oscillations around boundaries. 
              Explain that the rectangular frequency truncation inverse Fourier-transforms to a 2-D spatial Sinc function, 
              whose side-lobes cause Gibbs ringing. Switch to <strong>Gaussian LPF</strong> to demonstrate zero ringing.
            </p>
          </div>
        </div>
      </section>

      {/* Mathematical Formulations Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Rigorous Mathematical Equations
        </h3>

        <div className="space-y-6">
          {/* Equation 1: 2-D DFT */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. 2-D Discrete Fourier Transform (DFT) & Inverse DFT (IDFT)
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-sky-950 border border-slate-200 overflow-x-auto space-y-2">
              <div>
                <strong>Forward 2-D DFT:</strong> F(u, v) = ∑(x=0 to M-1) ∑(y=0 to N-1) f(x, y) · exp[-j 2π (ux/M + vy/N)]
              </div>
              <div>
                <strong>Inverse 2-D DFT:</strong> f(x, y) = (1 / MN) · ∑(u=0 to M-1) ∑(v=0 to N-1) F(u, v) · exp[+j 2π (ux/M + vy/N)]
              </div>
            </div>
            <p className="text-xs text-slate-600">
              The continuous spatial image f(x, y) of size M × N is decomposed into a linear sum of complex sinusoidal basis functions.
              The zero-frequency term F(0, 0) corresponds to the average image brightness (DC component).
            </p>
          </div>

          {/* Equation 2: Convolution Theorem */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. 2-D Spatial Convolution & The Convolution Theorem
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-sky-950 border border-slate-200 overflow-x-auto space-y-2">
              <div>
                <strong>Spatial Domain:</strong> g(x, y) = (f * h)(x, y) = ∑(m) ∑(n) f(m, n) · h(x - m, y - n)
              </div>
              <div>
                <strong>Frequency Domain:</strong> G(u, v) = F(u, v) · H(u, v)  ⇔  g(x, y) = ℱ⁻¹[ F(u, v) · H(u, v) ]
              </div>
            </div>
            <p className="text-xs text-slate-600">
              The Convolution Theorem states that circular convolution in the spatial domain is mathematically equivalent to point-wise 
              multiplication in the 2-D Fourier frequency domain, drastically reducing asymptotic complexity from O(M²N²) to O(MN log(MN)).
            </p>
          </div>

          {/* Equation 3: Frequency Filters */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Frequency Domain Filter Transfer Functions H(u, v)
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-sky-950 border border-slate-200 overflow-x-auto space-y-3">
              <div>
                <strong>Euclidean Frequency Distance:</strong> D(u, v) = √[ (u - M/2)² + (v - N/2)² ]
              </div>
              <div>
                <strong>Ideal Low-Pass (ILPF):</strong> H(u, v) = 1 if D(u, v) ≤ D₀ else 0
              </div>
              <div>
                <strong>Gaussian Low-Pass (GLPF):</strong> H(u, v) = exp[ - D²(u, v) / (2 · D₀²) ]
              </div>
              <div>
                <strong>Butterworth Low-Pass (BLPF):</strong> H(u, v) = 1 / [ 1 + (D(u, v) / D₀)^(2n) ]
              </div>
              <div>
                <strong>Butterworth Notch Reject:</strong> H(u, v) = ∏_k [ 1 / (1 + (D₀² / (D_k · D_-k))^n) ]
              </div>
            </div>
          </div>

          {/* Equation 4: Objective Quality Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Objective Image Quality Metrics (MSE, PSNR, SSIM)
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-sky-950 border border-slate-200 overflow-x-auto space-y-3">
              <div>
                <strong>Mean Squared Error (MSE):</strong> MSE = (1 / MN) · ∑(x=0 to M-1) ∑(y=0 to N-1) [ I(x, y) - K(x, y) ]²
              </div>
              <div>
                <strong>Peak Signal-to-Noise Ratio (PSNR):</strong> PSNR = 10 · log₁₀( 255² / MSE )  [decibels, dB]
              </div>
              <div>
                <strong>Structural Similarity Index (SSIM):</strong> SSIM(x, y) = [ (2μ_x μ_y + C₁) (2σ_xy + C₂) ] / [ (μ_x² + μ_y² + C₁) (σ_x² + σ_y² + C₂) ]
              </div>
            </div>
            <p className="text-xs text-slate-600">
              While MSE and PSNR measure absolute pixel differences, SSIM models the human visual system (HVS) by evaluating luminance (l), 
              contrast (c), and structural correlation (s).
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack & Architecture */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Full-Stack DSP Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Frontend Engineering:</span>
            <ul className="list-disc pl-4 text-slate-600 space-y-1">
              <li>React 19 with TypeScript and Vite bundler</li>
              <li>Tailwind CSS for professional engineering laboratory aesthetic</li>
              <li>Recharts for responsive PSNR/SSIM/MSE bar charts</li>
              <li>Framer Motion for smooth interactive transitions</li>
              <li>Custom before/after split drag slider & interactive zoom pan viewer</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Backend Scientific Engine:</span>
            <ul className="list-disc pl-4 text-slate-600 space-y-1">
              <li>Python 3.12 with FastAPI REST architecture and Uvicorn ASGI</li>
              <li>NumPy for vectorised Fourier transforms (fft2, ifft2, fftshift)</li>
              <li>OpenCV for high-performance spatial convolution and bilateral filtering</li>
              <li>scikit-image for structural similarity index (SSIM) computation</li>
              <li>Session manager with unique identifiers and memory lifecycle management</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
