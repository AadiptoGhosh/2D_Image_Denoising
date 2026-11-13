"""
DSP Image Lab - FastAPI Backend Server
Provides RESTful APIs for 2-D Digital Signal Processing:
- Noise Generation (Gaussian, Salt & Pepper, Speckle, Periodic)
- Spatial Domain Filtering (Mean, Gaussian, Median, Bilateral)
- 2-D Frequency Domain Filtering (Ideal LPF, Gaussian LPF, Butterworth LPF, Notch Reject)
- Objective Performance Evaluation (MSE, PSNR, SSIM, Latency)
- Batch Benchmarking & Dynamic Scientific Interpretation
"""

import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from algorithms.noise import (
    add_gaussian_noise,
    add_salt_and_pepper_noise,
    add_speckle_noise,
    add_periodic_noise
)
from algorithms.spatial_filters import (
    apply_mean_filter,
    apply_gaussian_filter,
    apply_median_filter,
    apply_bilateral_filter
)
from algorithms.frequency_filters import apply_frequency_filter
from algorithms.metrics import compute_metrics, generate_scientific_interpretation
from utils.image_io import numpy_to_base64, generate_benchmark_test_pattern
from utils.session_manager import session_manager


app = FastAPI(
    title="DSP Image Lab API",
    description="2-D Digital Signal Processing & Image Denoising Laboratory API",
    version="1.0.0",
    root_path="/api"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp"}


# --- Pydantic Request Models ---

class NoiseRequest(BaseModel):
    session_id: str
    noise_type: str = Field(..., description="gaussian, salt_and_pepper, speckle, periodic")
    # Gaussian
    mean: float = 0.0
    sigma: float = 25.0
    intensity: float = 1.0
    # Salt and Pepper
    density: float = 0.05
    salt_ratio: float = 0.5
    # Speckle
    variance: float = 0.05
    # Periodic
    frequency: float = 15.0
    amplitude: float = 35.0
    angle_degrees: float = 45.0
    # Common
    seed: Optional[int] = None


class SpatialFilterRequest(BaseModel):
    session_id: str
    filter_name: str = Field(..., description="mean, gaussian, median, bilateral")
    kernel_size: int = 3
    sigma: float = 1.0
    diameter: int = 9
    sigma_color: float = 75.0
    sigma_space: float = 75.0


class FrequencyFilterRequest(BaseModel):
    session_id: str
    filter_name: str = Field(..., description="ideal, gaussian, butterworth, notch")
    cutoff: float = 40.0
    order: int = 2
    notches: Optional[List[Dict[str, float]]] = None


class EvaluateRequest(BaseModel):
    session_id: str
    target_type: str = Field("filtered", description="'noisy' or 'filtered'")


class LoadSampleRequest(BaseModel):
    sample_id: str = Field(..., description="cameraman, astronaut, coins, geometric_pattern, synthetic_scene")


# --- API Routes ---

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DSP Image Lab API",
        "version": "1.0.0",
        "engine": "NumPy / OpenCV / SciPy / scikit-image"
    }


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Receives and validates uploaded image file (PNG, JPG, JPEG, BMP).
    Initializes a new DSP processing session.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Supported formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
        )

    # Decode image using OpenCV
    nparr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Corrupted or invalid image file.")

    # Create session
    session_id = session_manager.create_session(img, filename=file.filename)
    session = session_manager.get_session(session_id)

    h, w = img.shape[:2]
    channels = 1 if len(img.shape) == 2 else img.shape[2]

    # Baseline metrics (clean original compared to clean original: MSE=0, PSNR=100)
    baseline_metrics = compute_metrics(img, img, 0.0)

    return {
        "session_id": session_id,
        "filename": file.filename,
        "width": w,
        "height": h,
        "channels": channels,
        "dimensions": f"{w}x{h}",
        "original_image": numpy_to_base64(img),
        "noisy_image": numpy_to_base64(img),
        "metrics": baseline_metrics
    }


@app.get("/api/samples")
def list_samples():
    """
    Returns list of built-in DSP academic benchmark samples.
    """
    samples = [
        {"id": "cameraman", "name": "Cameraman (Classic 2-D DSP)", "description": "Standard grayscale benchmark with sharp edges and textured coat"},
        {"id": "astronaut", "name": "Eileen Collins / Astronaut", "description": "High dynamic range color image for spatial and color fidelity testing"},
        {"id": "coins", "name": "Coins (Contrast & Geometry)", "description": "High-contrast circular features suitable for frequency mask analysis"},
        {"id": "geometric_pattern", "name": "Siemens Star & Frequency Sweep", "description": "Mathematical radial chirp pattern designed for frequency response visualization"},
        {"id": "synthetic_scene", "name": "Synthetic Lab Scene", "description": "Structured gradients, solid geometrical solids, and fine horizontal grids"}
    ]
    return {"samples": samples}


@app.post("/api/load-sample")
def load_sample(req: LoadSampleRequest):
    """
    Loads a built-in benchmark test image directly into a session.
    """
    sample_path = os.path.join(os.path.dirname(__file__), "samples", f"{req.sample_id}.png")
    if os.path.exists(sample_path):
        img = cv2.imread(sample_path, cv2.IMREAD_UNCHANGED)
    else:
        # Generate on the fly
        pattern_map = {
            "geometric_pattern": "geometric",
            "synthetic_scene": "synthetic_landscape",
        }
        ptype = pattern_map.get(req.sample_id, "geometric")
        img = generate_benchmark_test_pattern(ptype, 512)

    if img is None:
        raise HTTPException(status_code=404, detail="Sample image not found")

    session_id = session_manager.create_session(img, filename=f"{req.sample_id}.png")
    h, w = img.shape[:2]
    channels = 1 if len(img.shape) == 2 else img.shape[2]

    return {
        "session_id": session_id,
        "filename": f"{req.sample_id}.png",
        "width": w,
        "height": h,
        "channels": channels,
        "dimensions": f"{w}x{h}",
        "original_image": numpy_to_base64(img),
        "noisy_image": numpy_to_base64(img),
        "metrics": compute_metrics(img, img, 0.0)
    }


@app.post("/api/noise")
def apply_noise_api(req: NoiseRequest):
    """
    Applies synthetic programmatic noise to the original clean image:
    Gaussian, Salt-and-Pepper, Speckle, or Periodic noise.
    """
    session = session_manager.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please upload an image.")

    clean_img = session.original_image
    ntype = req.noise_type.lower()

    if ntype == "gaussian":
        noisy_img, params = add_gaussian_noise(
            clean_img,
            mean=req.mean,
            sigma=req.sigma,
            intensity=req.intensity,
            seed=req.seed
        )
    elif ntype in ["salt_and_pepper", "salt_pepper"]:
        noisy_img, params = add_salt_and_pepper_noise(
            clean_img,
            density=req.density,
            salt_ratio=req.salt_ratio,
            seed=req.seed
        )
    elif ntype == "speckle":
        noisy_img, params = add_speckle_noise(
            clean_img,
            variance=req.variance,
            seed=req.seed
        )
    elif ntype == "periodic":
        noisy_img, params = add_periodic_noise(
            clean_img,
            frequency=req.frequency,
            amplitude=req.amplitude,
            angle_degrees=req.angle_degrees,
            seed=req.seed
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported noise type '{req.noise_type}'")

    # Update session state
    session.noisy_image = noisy_img
    session.noise_metadata = params
    session.last_filtered_image = None
    session.filter_history.clear()

    # Calculate noisy degradation metrics against original clean image
    metrics = compute_metrics(clean_img, noisy_img, 0.0)

    return {
        "session_id": req.session_id,
        "noisy_image": numpy_to_base64(noisy_img),
        "noise_params": params,
        "metrics": metrics
    }


@app.post("/api/reset")
def reset_session(data: Dict[str, str]):
    session_id = data.get("session_id")
    if not session_id or not session_manager.reset_to_original(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = session_manager.get_session(session_id)
    orig = session.original_image
    return {
        "session_id": session_id,
        "original_image": numpy_to_base64(orig),
        "noisy_image": numpy_to_base64(orig),
        "metrics": compute_metrics(orig, orig, 0.0)
    }


@app.post("/api/spatial-filter")
def apply_spatial_filter_api(req: SpatialFilterRequest):
    """
    Applies spatial-domain filter to the current noisy image:
    Mean, Gaussian, Median, or Bilateral.
    """
    session = session_manager.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    input_img = session.noisy_image
    fname = req.filter_name.lower()

    if fname == "mean":
        filtered_img, elapsed_ms, params = apply_mean_filter(input_img, req.kernel_size)
    elif fname == "gaussian":
        filtered_img, elapsed_ms, params = apply_gaussian_filter(input_img, req.kernel_size, req.sigma)
    elif fname == "median":
        filtered_img, elapsed_ms, params = apply_median_filter(input_img, req.kernel_size)
    elif fname == "bilateral":
        filtered_img, elapsed_ms, params = apply_bilateral_filter(
            input_img, req.diameter, req.sigma_color, req.sigma_space
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unknown spatial filter '{req.filter_name}'")

    session.last_filtered_image = filtered_img

    # Compute metrics against original clean image
    metrics = compute_metrics(session.original_image, filtered_img, elapsed_ms)

    result_entry = {
        "category": "Spatial",
        "filter": fname,
        "name": params.get("name", fname.title()),
        "params": params,
        "metrics": metrics
    }
    
    # Store in history (avoiding duplicate filter names)
    session.filter_history = [item for item in session.filter_history if item["filter"] != fname]
    session.filter_history.append(result_entry)

    return {
        "session_id": req.session_id,
        "filtered_image": numpy_to_base64(filtered_img),
        "filter_params": params,
        "metrics": metrics,
        "execution_time_ms": elapsed_ms
    }


@app.post("/api/frequency-filter")
def apply_frequency_filter_api(req: FrequencyFilterRequest):
    """
    Applies 2-D Fourier Transform Frequency Domain Filtering:
    Ideal LPF, Gaussian LPF, Butterworth LPF, or Notch Reject Filter.
    Returns:
    - Reconstructed image
    - Input Fourier magnitude spectrum
    - Filter mask visualization
    - Filtered Fourier magnitude spectrum
    - Real-time execution latency
    - Objective metrics
    """
    session = session_manager.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    input_img = session.noisy_image
    fname = req.filter_name.lower()

    reconstructed, in_spectrum, mask_vis, out_spectrum, elapsed_ms, meta = apply_frequency_filter(
        image=input_img,
        filter_type=fname,
        cutoff=req.cutoff,
        order=req.order,
        notches=req.notches
    )

    session.last_filtered_image = reconstructed

    # Calculate metrics against original clean image
    metrics = compute_metrics(session.original_image, reconstructed, elapsed_ms)

    result_entry = {
        "category": "Frequency",
        "filter": f"freq_{fname}",
        "name": meta.get("filter_name", fname.title()),
        "params": meta,
        "metrics": metrics
    }
    session.filter_history = [item for item in session.filter_history if item["filter"] != f"freq_{fname}"]
    session.filter_history.append(result_entry)

    return {
        "session_id": req.session_id,
        "filtered_image": numpy_to_base64(reconstructed),
        "input_spectrum": numpy_to_base64(in_spectrum),
        "filter_mask": numpy_to_base64(mask_vis),
        "filtered_spectrum": numpy_to_base64(out_spectrum),
        "filter_params": meta,
        "metrics": metrics,
        "execution_time_ms": elapsed_ms
    }


@app.post("/api/evaluate")
def evaluate_image(req: EvaluateRequest):
    """
    Calculates exact MSE, PSNR, SSIM metrics between original image and specified target.
    """
    session = session_manager.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if req.target_type == "noisy":
        target = session.noisy_image
    else:
        target = session.last_filtered_image
        if target is None:
            target = session.noisy_image

    metrics = compute_metrics(session.original_image, target, 0.0)
    return {
        "session_id": req.session_id,
        "target_type": req.target_type,
        "metrics": metrics
    }


@app.post("/api/batch-evaluate")
def run_batch_evaluation(data: Dict[str, str]):
    """
    Runs all benchmark spatial and frequency filters across the current noisy image.
    Generates a full comparative performance analysis dataset with charts and scientific interpretation.
    """
    session_id = data.get("session_id")
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    clean = session.original_image
    noisy = session.noisy_image
    noise_type = session.noise_metadata.get("type", "unknown")

    noisy_metrics = compute_metrics(clean, noisy, 0.0)

    benchmark_results = []

    # 1. Spatial Filters
    # Mean
    f_mean, t_mean, p_mean = apply_mean_filter(noisy, 3)
    m_mean = compute_metrics(clean, f_mean, t_mean)
    benchmark_results.append({
        "id": "mean",
        "name": "Mean Filter (3x3)",
        "category": "Spatial",
        "description": "Linear box neighborhood averaging",
        "metrics": m_mean,
        "thumbnail": numpy_to_base64(f_mean)
    })

    # Gaussian
    f_gauss, t_gauss, p_gauss = apply_gaussian_filter(noisy, 5, 1.0)
    m_gauss = compute_metrics(clean, f_gauss, t_gauss)
    benchmark_results.append({
        "id": "gaussian",
        "name": "Gaussian Filter (5x5, \u03c3=1.0)",
        "category": "Spatial",
        "description": "Weighted spatial distance averaging",
        "metrics": m_gauss,
        "thumbnail": numpy_to_base64(f_gauss)
    })

    # Median
    f_med, t_med, p_med = apply_median_filter(noisy, 3)
    m_med = compute_metrics(clean, f_med, t_med)
    benchmark_results.append({
        "id": "median",
        "name": "Median Filter (3x3)",
        "category": "Spatial",
        "description": "Non-linear rank order impulse suppression",
        "metrics": m_med,
        "thumbnail": numpy_to_base64(f_med)
    })

    # Bilateral
    f_bilat, t_bilat, p_bilat = apply_bilateral_filter(noisy, 9, 75.0, 75.0)
    m_bilat = compute_metrics(clean, f_bilat, t_bilat)
    benchmark_results.append({
        "id": "bilateral",
        "name": "Bilateral Filter (d=9)",
        "category": "Spatial",
        "description": "Range + Domain photometric edge preservation",
        "metrics": m_bilat,
        "thumbnail": numpy_to_base64(f_bilat)
    })

    # 2. Frequency Filters
    # Ideal LPF
    f_ilpf, _, _, _, t_ilpf, _ = apply_frequency_filter(noisy, "ideal", cutoff=40.0)
    m_ilpf = compute_metrics(clean, f_ilpf, t_ilpf)
    benchmark_results.append({
        "id": "freq_ideal",
        "name": "Ideal LPF (D0=40)",
        "category": "Frequency",
        "description": "Hard frequency cutoff (exhibits Gibbs ringing)",
        "metrics": m_ilpf,
        "thumbnail": numpy_to_base64(f_ilpf)
    })

    # Gaussian LPF
    f_glpf, _, _, _, t_glpf, _ = apply_frequency_filter(noisy, "gaussian", cutoff=40.0)
    m_glpf = compute_metrics(clean, f_glpf, t_glpf)
    benchmark_results.append({
        "id": "freq_gaussian",
        "name": "Gaussian LPF (D0=40)",
        "category": "Frequency",
        "description": "Smooth frequency rolloff with zero spatial ringing",
        "metrics": m_glpf,
        "thumbnail": numpy_to_base64(f_glpf)
    })

    # Butterworth LPF
    f_blpf, _, _, _, t_blpf, _ = apply_frequency_filter(noisy, "butterworth", cutoff=40.0, order=2)
    m_blpf = compute_metrics(clean, f_blpf, t_blpf)
    benchmark_results.append({
        "id": "freq_butterworth",
        "name": "Butterworth LPF (D0=40, n=2)",
        "category": "Frequency",
        "description": "Smooth maximally flat passband transition",
        "metrics": m_blpf,
        "thumbnail": numpy_to_base64(f_blpf)
    })

    # If periodic noise, also evaluate Notch Reject Filter
    if noise_type == "periodic":
        u0 = session.noise_metadata.get("u0_component", 15.0)
        v0 = session.noise_metadata.get("v0_component", 15.0)
        f_notch, _, _, _, t_notch, _ = apply_frequency_filter(
            noisy, "notch", order=2, notches=[{"u": u0, "v": v0, "radius": 15.0}]
        )
        m_notch = compute_metrics(clean, f_notch, t_notch)
        benchmark_results.append({
            "id": "freq_notch",
            "name": "Notch Reject Filter",
            "category": "Frequency",
            "description": "Conjugate harmonic spectral notch rejection",
            "metrics": m_notch,
            "thumbnail": numpy_to_base64(f_notch)
        })

    # Generate scientific interpretation
    interpretation = generate_scientific_interpretation(noise_type, noisy_metrics, benchmark_results)

    return {
        "session_id": session_id,
        "noise_type": noise_type,
        "noise_metadata": session.noise_metadata,
        "baseline_metrics": noisy_metrics,
        "results": benchmark_results,
        "interpretation": interpretation
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
