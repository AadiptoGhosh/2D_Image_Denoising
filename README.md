# DSP Image Lab – Image Denoising Using 2-D Digital Signal Processing (DSP)

**Live Server:** https://2dimagedenoising.vercel.app/

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NumPy](https://img.shields.io/badge/NumPy-2-013243?style=flat&logo=numpy&logoColor=white)](https://numpy.org)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.9+-5C3EE8?style=flat&logo=opencv&logoColor=white)](https://opencv.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**DSP Image Lab** is an academic-grade, full-stack scientific web application developed for Electrical and Computer Engineering (ECE) and Digital Signal Processing (DSP) laboratory studies. The platform enables rigorous experimentation in two-dimensional image degradation and subsequent restoration using spatial-domain convolution kernels and frequency-domain discrete Fourier transfer functions.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Technology Stack](#4-technology-stack)
5. [DSP Theory & Mathematical Formulations](#5-dsp-theory--mathematical-formulations)
6. [Algorithms Implemented](#6-algorithms-implemented)
7. [System Architecture](#7-system-architecture)
8. [Project Directory Structure](#8-project-directory-structure)
9. [Installation & Setup Instructions](#9-installation--setup-instructions)
10. [Backend Execution Instructions](#10-backend-execution-instructions)
11. [Frontend Execution Instructions](#11-frontend-execution-instructions)
12. [REST API Documentation](#12-rest-api-documentation)
13. [Expected Experimental Workflow](#13-expected-experimental-workflow)
14. [Limitations & Future Enhancements](#14-limitations--future-enhancements)

---

## 1. Project Overview

Digital images are two-dimensional discrete spatial signals $f(x, y)$ that routinely suffer degradation during acquisition, optical transmission, analogue-to-digital conversion, and atmospheric propagation. 

**DSP Image Lab** allows students, researchers, and examiners to:
- Programmatically inject stochastic (Gaussian, Salt & Pepper, Speckle) and deterministic (Periodic) noise into standard test benchmarks or user-uploaded imagery.
- Apply spatial domain linear (Mean, Gaussian) and non-linear (Median, Bilateral) filters with fine-grained parameter tuning.
- Conduct full 2-D Fast Fourier Transform (FFT) frequency-domain filtering (Ideal LPF, Gaussian LPF, Butterworth LPF, and Notch Reject Filters) with 5-stage logarithmic spectral visualizations.
- Evaluate exact quantitative objective fidelity metrics: Mean Squared Error (MSE), Peak Signal-to-Noise Ratio (PSNR in dB), Structural Similarity Index (SSIM), and computational latency in milliseconds.
- Generate dynamic scientific interpretations contextualizing why specific filtering regimes succeed or fail under particular noise physics.

---

## 2. Problem Statement

Image degradation corrupts continuous signals into noisy discrete approximations $g(x, y) = f(x, y) \odot \eta(x, y)$. In real-world engineering systems (such as medical imaging, satellite telemetry, and radar), simple filtering techniques often introduce undesirable side-effects:
- Averaging spatial filters blur high-frequency edge gradients and micro-textures.
- Sharp frequency-domain truncation triggers Gibbs phenomenon ringing artifacts in reconstructed spatial signals.
- Periodic harmonic interference corrupts spatial features across the entire image canvas.

A dedicated interactive computational laboratory is required to mathematically analyze, demonstrate, and compare spatial vs frequency domain restoration mechanisms without relying on static mockups or notebook cells.

---

## 3. Objectives

1. **Stochastic & Deterministic Noise Modeling**: Programmatically synthesize Additive White Gaussian Noise (AWGN), Salt-and-Pepper impulse noise, multiplicative speckle noise, and 2-D sinusoidal periodic interference with reproducible random seed controls.
2. **Spatial Domain Image Processing**: Implement discrete 2-D neighborhood convolutions in Python using OpenCV for Box/Mean, Gaussian weighted, Median rank-order, and Bilateral edge-preserving filters.
3. **2-D Discrete Fourier Transform Processing**: Implement mathematically rigorous 2-D FFT, spectrum zero-frequency centering (`fftshift`), frequency mask generation, transfer function multiplication, inverse shift, and inverse 2-D FFT (`ifft2`) reconstruction.
4. **Logarithmic Spectrum Visualization**: Render 2-D magnitude spectra using standard scientific logarithmic compression:
   $$S(u, v) = 20 \log_{10}(1 + |F(u, v)|)$$
5. **Harmonic Interference Notch Filtering**: Implement conjugate Butterworth Notch Reject Filters to surgically excise sinusoidal stripe frequencies in the Fourier domain.
6. **Objective Quality Benchmarking**: Quantitatively benchmark all algorithms against the original clean reference using true MSE, PSNR, SSIM, and execution latency.
7. **Interactive Scientific UI/UX**: Provide an engineering dashboard featuring side-by-side comparisons, before-and-after split sliders, high-magnification pan/zoom viewers, and interactive Recharts performance plots.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 19 (TypeScript)
- **Tooling & Bundler**: Vite 6.x
- **Styling**: Tailwind CSS v4 (Ice-blue, slate, and steel-blue laboratory aesthetic)
- **Data Visualization**: Recharts (Interactive PSNR, SSIM, MSE, and latency bar charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios (REST API communication with Vite reverse proxy)

### Backend
- **Language**: Python 3.12+
- **Web Framework**: FastAPI (High-performance asynchronous REST API)
- **ASGI Server**: Uvicorn
- **Scientific Computing**: NumPy (Vectorized 2-D FFT, distance matrices, programmatic noise synthesis)
- **Computer Vision**: OpenCV (`opencv-python-headless` for spatial convolution and bilateral filters)
- **Signal Processing**: SciPy & scikit-image (`skimage.metrics` for true SSIM computation)
- **Data Validation**: Pydantic v2

---

## 5. DSP Theory & Mathematical Formulations

### 5.1 2-D Discrete Fourier Transform (DFT) & Inverse DFT (IDFT)
For an image $f(x, y)$ of dimensions $M \times N$, the forward 2-D DFT transforms spatial intensity coordinates into spatial frequency coordinates $(u, v)$:

$$F(u, v) = \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} f(x, y) \cdot \exp\left[-j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)\right]$$

The inverse 2-D DFT reconstructs the continuous/discrete spatial signal from the frequency spectrum:

$$f(x, y) = \frac{1}{M N} \sum_{u=0}^{M-1} \sum_{v=0}^{N-1} F(u, v) \cdot \exp\left[+j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)\right]$$

The zero-frequency component $F(0, 0) = \sum \sum f(x, y)$ corresponds to $M N$ times the average image brightness (DC component). In digital signal processing, `fftshift` translates $F(0, 0)$ to the center $(M/2, N/2)$ of the 2-D array.

### 5.2 2-D Spatial Discrete Convolution
Discrete spatial filtering replaces each pixel $(x, y)$ with a linear combination of neighborhood pixels defined by a kernel $h$ of size $K \times K$:

$$g(x, y) = (f * h)(x, y) = \sum_{m=-a}^{a} \sum_{n=-b}^{b} f(x - m, y - n) \cdot h(m, n)$$

**The 2-D Convolution Theorem:**
$$\mathcal{F}\{ (f * h)(x, y) \} = F(u, v) \cdot H(u, v)$$

Circular convolution in the spatial domain is mathematically equivalent to point-wise multiplication in the frequency domain.

### 5.3 Noise Probability Density Functions (PDF)

#### A. Additive White Gaussian Noise (AWGN)
The intensity perturbation $z$ follows a normal distribution with mean $\mu$ and variance $\sigma^2$:

$$p(z) = \frac{1}{\sqrt{2\pi}\sigma} \exp\left[ -\frac{(z - \mu)^2}{2\sigma^2} \right]$$

Degraded image: $g(x, y) = \text{clip}(f(x, y) + \eta_G, 0, 255)$.

#### B. Salt-and-Pepper (Bipolar Impulse) Noise
Random discrete bit drops:

$$p(z) = \begin{cases} P_a & \text{for } z = a \text{ (Pepper, 0)} \\ P_b & \text{for } z = b \text{ (Salt, 255)} \\ 1 - (P_a + P_b) & \text{for } z = f(x, y) \end{cases}$$

#### C. Multiplicative Speckle Noise
Common in synthetic aperture radar (SAR) and ultrasound:

$$g(x, y) = f(x, y) + f(x, y) \cdot \eta_{\text{speckle}}, \quad \eta_{\text{speckle}} \sim \mathcal{N}(0, \sigma_v^2)$$

#### D. Periodic Sinusoidal Interference
Deterministic harmonic interference creating visible spatial stripes:

$$g(x, y) = f(x, y) + A \cdot \sin\left[ 2\pi \left( \frac{u_0 x}{M} + \frac{v_0 y}{N} \right) \right]$$

In the 2-D Fourier magnitude spectrum, this introduces two symmetric conjugate impulses at $(+u_0, +v_0)$ and $(-u_0, -v_0)$.

### 5.4 Frequency-Domain Filter Transfer Functions
Let $D(u, v) = \sqrt{(u - M/2)^2 + (v - N/2)^2}$ represent the Euclidean distance from the centered zero-frequency origin.

- **Ideal Low-Pass Filter (ILPF)**:
  $$H(u, v) = \begin{cases} 1 & \text{if } D(u, v) \le D_0 \\ 0 & \text{if } D(u, v) > D_0 \end{cases}$$
  *Characteristics*: Discontinuous step transition. Its inverse Fourier transform is a 2-D Sinc function $\frac{J_1(r)}{r}$, causing Gibbs ringing ripples in spatial domain edges.

- **Gaussian Low-Pass Filter (GLPF)**:
  $$H(u, v) = \exp\left[ -\frac{D^2(u, v)}{2 D_0^2} \right]$$
  *Characteristics*: Completely smooth transition with zero spatial ringing because the Fourier transform of a Gaussian function is strictly another Gaussian.

- **Butterworth Low-Pass Filter (BLPF)**:
  $$H(u, v) = \frac{1}{1 + \left[ \frac{D(u, v)}{D_0} \right]^{2n}}$$
  *Characteristics*: Governed by order $n$. At order $n=1$, it mimics Gaussian rolloff; at high orders ($n \ge 4$), it approaches the Ideal LPF with gradual ringing onset.

- **Butterworth Notch Reject Filter (NRF)**:
  For periodic noise spikes located at $(u_k, v_k)$:
  $$D_k(u, v) = \sqrt{(u - M/2 - u_k)^2 + (v - N/2 - v_k)^2}$$
  $$D_{-k}(u, v) = \sqrt{(u - M/2 + u_k)^2 + (v - N/2 + v_k)^2}$$
  $$H(u, v) = \prod_{k=1}^Q \frac{1}{1 + \left[ \frac{D_0^2}{D_k(u, v) \cdot D_{-k}(u, v)} \right]^n}$$

### 5.5 Objective Quality Evaluation Metrics

#### A. Mean Squared Error (MSE)
Measures average squared intensity deviation between clean reference $I$ and denoised estimate $K$:

$$\text{MSE} = \frac{1}{M N} \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} [I(x, y) - K(x, y)]^2$$

#### B. Peak Signal-to-Noise Ratio (PSNR)
Expressed in logarithmic decibels (dB), where $\text{MAX}_I = 255$:

$$\text{PSNR} = 10 \cdot \log_{10} \left( \frac{\text{MAX}_I^2}{\text{MSE}} \right) = 20 \cdot \log_{10} \left( \frac{255}{\sqrt{\text{MSE}}} \right)$$

If $\text{MSE} = 0$, $\text{PSNR} \to \infty$ (flagged as 100.0 dB exact match).

#### C. Structural Similarity Index Measure (SSIM)
Evaluates human visual perception by measuring luminance $l$, contrast $c$, and structural correlation $s$:

$$\text{SSIM}(x, y) = [l(x, y)]^\alpha \cdot [c(x, y)]^\beta \cdot [s(x, y)]^\gamma = \frac{(2\mu_x \mu_y + C_1)(2\sigma_{xy} + C_2)}{(\mu_x^2 + \mu_y^2 + C_1)(\sigma_x^2 + \sigma_y^2 + C_2)}$$

where $\mu$ denotes local mean, $\sigma^2$ denotes local variance, $\sigma_{xy}$ denotes covariance, and $C_1 = (K_1 L)^2, C_2 = (K_2 L)^2$ prevent numerical division by zero.

---

## 6. Algorithms Implemented

| Domain | Algorithm | Type | Key Mathematical Controls | Primary Application |
|---|---|---|---|---|
| **Spatial** | Mean (Box) Filter | Linear Averaging | Kernel size: $3\times3, 5\times5, 7\times7$ | General Gaussian noise reduction |
| **Spatial** | Gaussian Filter | Linear Weighted | Kernel size, Spatial standard deviation $\sigma$ | Continuous natural smoothing |
| **Spatial** | Median Filter | Non-linear Rank-Order | Window size $K \in \{3, 5, 7\}$ | Impulsive Salt & Pepper noise removal |
| **Spatial** | Bilateral Filter | Non-linear Edge-Preserving | Diameter $d$, $\sigma_{\text{color}}$, $\sigma_{\text{space}}$ | Smoothing textures without blurring edges |
| **Frequency** | Ideal Low-Pass (ILPF) | Hard Cutoff Fourier Mask | Cutoff radius $D_0$ | Academic Gibbs ringing demonstration |
| **Frequency** | Gaussian Low-Pass (GLPF) | Smooth Exponential Mask | Cutoff radius $D_0$ | Ringing-free frequency attenuation |
| **Frequency** | Butterworth LPF (BLPF) | Maximally Flat Transition | Cutoff radius $D_0$, Order $n$ | Controlled frequency rolloff steepness |
| **Frequency** | Notch Reject Filter (NRF) | Conjugate Harmonic Notch | Notch coordinates $(u_0, v_0)$, Radius $D_0$, Order $n$ | Surgical periodic noise stripe elimination |

---

## 7. System Architecture

```
+-----------------------------------------------------------------------------------+
|                           DSP Image Lab - Architecture                            |
+-----------------------------------------------------------------------------------+

   Client Web Browser (Desktop / Tablet / Mobile)
        |
        v
   [ React 19 + TypeScript + Tailwind CSS Frontend ]  (Port 5173)
        |-- Navigation & View Switcher (Overview, Lab, Spatial, Frequency, Analysis, About)
        |-- Reusable Components: ImageCard, ImageComparisonSlider, ImageZoomModal, MetricBadge
        |-- Interactive Recharts: PSNR, SSIM, MSE, and Latency Charts
        |-- REST API Client (Axios + TypeScript Type Interfaces)
        |
        |  RESTful JSON / Multipart HTTP (Vite Proxy: /api -> http://127.0.0.1:8000)
        v
   [ FastAPI + Uvicorn ASGI Backend Engine ]  (Port 8000)
        |
        |-- Session Manager (UUID Session Management, Image Caching, Auto-Cleanup)
        |-- algorithms/noise.py (NumPy Vectorized Noise Generators)
        |-- algorithms/spatial_filters.py (OpenCV Spatial 2-D Convolutions)
        |-- algorithms/frequency_filters.py (NumPy 2-D FFT2, FFTSHIFT, Masks, IFFT2)
        |-- algorithms/metrics.py (NumPy MSE/PSNR + scikit-image SSIM + Dynamic Rationale)
        |-- utils/image_io.py (Base64 Encoders/Decoders & Benchmark Test Generators)
```

---

## 8. Project Directory Structure

```
DSP/
├── backend/
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── noise.py                # Gaussian, Salt & Pepper, Speckle, Periodic noise
│   │   ├── spatial_filters.py      # Mean, Gaussian, Median, Bilateral filters
│   │   ├── frequency_filters.py    # 2-D FFT, ILPF, GLPF, BLPF, Notch reject filter
│   │   └── metrics.py              # MSE, PSNR, SSIM, Dynamic scientific interpretation
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── image_io.py             # Base64 serialization & synthetic pattern generation
│   │   └── session_manager.py      # Session lifecycle & in-memory state tracking
│   ├── main.py                     # FastAPI REST API endpoints & CORS middleware
│   ├── requirements.txt            # Python dependencies
│   └── .venv/                      # Python virtual environment (uv/pip)
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg             # Custom DSP pixel waveform logo
│   │   └── ...
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Laboratory navigation bar & engine health badge
│   │   │   ├── ImageCard.tsx       # Reusable image container with download & zoom
│   │   │   ├── ImageComparisonSlider.tsx # Interactive before/after split slider
│   │   │   ├── ImageZoomModal.tsx  # High-magnification pan & zoom viewer
│   │   │   └── MetricBadge.tsx     # PSNR, SSIM, MSE, and latency pill badges
│   │   ├── pages/
│   │   │   ├── HomeOverview.tsx    # Landing overview & visual processing pipeline
│   │   │   ├── ImageLab.tsx        # Upload, sample selector, noise controls
│   │   │   ├── SpatialFiltering.tsx # Spatial domain workstation
│   │   │   ├── FrequencyFiltering.tsx # 2-D Fourier spectrum suite & notch filter
│   │   │   ├── PerformanceAnalysis.tsx# Recharts benchmark dashboards & CSV export
│   │   │   └── AboutTheory.tsx     # Mathematical formulations & viva defense guide
│   │   ├── services/
│   │   │   └── api.ts              # Typed Axios API client
│   │   ├── types/
│   │   │   └── dsp.ts              # TypeScript interfaces & types
│   │   ├── App.tsx                 # Core application controller
│   │   ├── main.tsx                # React DOM root entry
│   │   └── index.css               # Tailwind CSS v4 styling rules
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts              # Vite configuration with /api reverse proxy
│
├── samples/                        # Academic benchmark test images
│   ├── cameraman.png               # Classic 2-D DSP grayscale reference
│   ├── astronaut.png               # Eileen Collins high dynamic range color test
│   ├── coins.png                   # High contrast circular objects
│   ├── geometric_pattern.png       # Siemens Star radial chirp frequency chart
│   └── synthetic_scene.png         # Synthetic structured geometric gradients
│
├── .gitignore                      # Git ignore patterns
└── README.md                       # Comprehensive documentation
```

---

## 9. Installation & Setup Instructions

### Prerequisites
- **Python**: Version 3.10, 3.11, or 3.12 installed
- **Node.js**: Version 18.x, 20.x, or 22.x installed (includes `npm`)
- Optional: `uv` for ultra-fast Python package installation

### Clone the Repository
```bash
git clone <repository_url>
cd DSP
```

---

## 10. Backend Execution Instructions

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .\.venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source .venv/bin/activate
     ```

4. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Or with uv: `uv pip install -r requirements.txt`)*

5. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

The backend API will start at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

---

## 11. Frontend Execution Instructions

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The web application will open at: `http://127.0.0.1:5173/`

*(Note: The frontend automatically proxies all `/api/*` calls to `http://127.0.0.1:8000` via Vite configuration).*

---

## 12. REST API Documentation

| Method | Endpoint | Description | Payload Sample |
|---|---|---|---|
| `GET` | `/api/health` | Health check & engine status | None |
| `GET` | `/api/samples` | List built-in academic benchmark images | None |
| `POST` | `/api/upload` | Upload custom image (`multipart/form-data`) | `file: <binary image>` |
| `POST` | `/api/load-sample` | Load benchmark image into session | `{"sample_id": "cameraman"}` |
| `POST` | `/api/noise` | Generate synthetic noise on image | `{"session_id": "...", "noise_type": "gaussian", "sigma": 25.0, "seed": 42}` |
| `POST` | `/api/reset` | Revert noisy state to original clean image | `{"session_id": "..."}` |
| `POST` | `/api/spatial-filter` | Apply Mean, Gaussian, Median, or Bilateral filter | `{"session_id": "...", "filter_name": "median", "kernel_size": 3}` |
| `POST` | `/api/frequency-filter` | Apply 2-D FFT frequency transfer filter | `{"session_id": "...", "filter_name": "butterworth", "cutoff": 40.0, "order": 2}` |
| `POST` | `/api/evaluate` | Compute MSE, PSNR, SSIM on specified target | `{"session_id": "...", "target_type": "filtered"}` |
| `POST` | `/api/batch-evaluate` | Run all filters concurrently for comparative benchmark | `{"session_id": "..."}` |

---

## 13. Expected Experimental Workflow

### Scenario 1: Salt-and-Pepper Noise vs. Median Filter
1. In **Image Lab**, load the **Cameraman** benchmark.
2. Select **Salt & Pepper Noise**, configure density to `0.06` (6%), and click **Apply Noise**. Notice PSNR drop to ~17 dB.
3. Switch to **Spatial Domain Filtering**. Apply **Mean Filter (3x3)** and observe PSNR (~23 dB) with visible blurred gray spots.
4. Next, select **Median Filter (3x3)** and click **Apply Spatial Filter**. Observe PSNR jump to **>30 dB** with complete elimination of impulse spikes and clean edge preservation!

### Scenario 2: Periodic Noise Removal with 2-D FFT Notch Filter
1. In **Image Lab**, select **Periodic Noise**, set Frequency to `15 cycles`, Amplitude to `40`, and click **Apply Noise**.
2. Notice the severe parallel diagonal stripes across the entire image.
3. Switch to **Frequency Domain Filtering**. Inspect the 2-D Fourier Magnitude Spectrum to see the prominent bright conjugate harmonic impulses.
4. Select **Notch Reject Filter**, configure notch coordinates $(u_0 = 11, v_0 = 11)$ and radius $D_0 = 15$, then click **Execute 2-D Frequency Filter**.
5. Observe the notch mask zeroing out the harmonic points. In the reconstructed image, the stripes disappear entirely while preserving the underlying sharp details!

### Scenario 3: Complete Performance Benchmarking
1. With any degraded image, navigate to **Performance Analysis**.
2. Click **Run Complete Benchmark Suite**.
3. The system executes all 7 spatial and frequency filters in Python, computing exact MSE, PSNR, SSIM, and latency.
4. Inspect the interactive Recharts bar charts, detailed matrix table, and read the automatically generated scientific interpretation.
5. Export the dataset as a CSV report for inclusion in academic laboratory submissions.

---

## 14. Limitations & Future Enhancements

### Current Limitations
- **Resolution Cap**: For real-time 2-D FFT and bilateral filter performance over HTTP, uploads are capped at 15 MB.
- **Grayscale 2-D FFT**: Frequency-domain filtering converts images to 2-D discrete grayscale arrays to strictly adhere to classical DSP curriculum specifications.

### Future Enhancements
- **Color Frequency Filtering**: Extend 2-D FFT to multi-channel quaternion or YCbCr color spaces.
- **Wavelet Transform Domain**: Integrate 2-D Discrete Wavelet Transform (DWT) thresholding (VisuShrink, BayesShrink).
- **Homomorphic Filtering**: Implement illumination-reflectance logarithmic frequency decoupling for non-uniform lighting correction.
- **Wiener & Constrained Least Squares**: Implement inverse restoration with point spread function (PSF) deconvolution.

---

## Academic Citation & References
1. Gonzalez, R. C., & Woods, R. E. *Digital Image Processing*, 4th Edition, Pearson.
2. Oppenheim, A. V., & Schafer, R. W. *Discrete-Time Signal Processing*, 3rd Edition, Prentice Hall.
3. Wang, Z., Bovik, A. C., Sheikh, H. R., & Simoncelli, E. P. (2004). "Image quality assessment: from error visibility to structural similarity." *IEEE Transactions on Image Processing*, 13(4), 600-612.
4. Tomasi, C., & Manduchi, R. (1998). "Bilateral filtering for gray and color images." *Sixth International Conference on Computer Vision (IEEE)*.
