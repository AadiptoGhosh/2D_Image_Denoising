"""
Frequency Domain Filtering Module using 2-D Discrete Fourier Transform (2-D DFT)
Implements:
1. Ideal Low-Pass Filter (ILPF)
2. Gaussian Low-Pass Filter (GLPF)
3. Butterworth Low-Pass Filter (BLPF)
4. Notch Reject Filter (NRF) for Periodic Noise Removal

Provides logarithmic magnitude spectrum visualisations and mask matrices.
"""

import time
import cv2
import numpy as np
from typing import Tuple, Dict, Any, List, Optional


def compute_log_magnitude_spectrum(f_shifted: np.ndarray) -> np.ndarray:
    """
    Computes logarithmic magnitude spectrum visualization:
    S(u, v) = 20 * log10(1 + |F(u, v)|)
    Normalized to 8-bit unsigned integer [0, 255] for image display.
    """
    magnitude = np.abs(f_shifted)
    # 20 * log10(1 + abs(F))
    spectrum_log = 20.0 * np.log10(1.0 + magnitude)
    
    s_min = spectrum_log.min()
    s_max = spectrum_log.max()
    
    if s_max > s_min:
        norm_spectrum = ((spectrum_log - s_min) / (s_max - s_min) * 255.0).astype(np.uint8)
    else:
        norm_spectrum = np.zeros_like(spectrum_log, dtype=np.uint8)
        
    return norm_spectrum


def create_distance_matrix(height: int, width: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generates the Euclidean distance grid D(u, v) from the shifted center (M/2, N/2).
    """
    # Shifted zero-frequency center
    cy = height / 2.0
    cx = width / 2.0
    
    y = np.arange(height) - cy
    x = np.arange(width) - cx
    
    # Meshgrid (y corresponds to rows/U, x corresponds to cols/V)
    X, Y = np.meshgrid(x, y)
    D = np.sqrt(X**2 + Y**2)
    return D, Y, X


def generate_ideal_lpf(height: int, width: int, cutoff: float) -> np.ndarray:
    """
    Ideal Low-Pass Filter transfer function:
    H(u, v) = 1 if D(u, v) <= D0 else 0
    Exhibits ringing (Gibbs phenomenon) in spatial reconstruction.
    """
    D, _, _ = create_distance_matrix(height, width)
    H = np.where(D <= cutoff, 1.0, 0.0)
    return H


def generate_gaussian_lpf(height: int, width: int, cutoff: float) -> np.ndarray:
    """
    Gaussian Low-Pass Filter transfer function:
    H(u, v) = exp(- D^2(u, v) / (2 * D0^2))
    Completely smooth frequency fall-off; zero spatial ringing.
    """
    D, _, _ = create_distance_matrix(height, width)
    d0 = max(1e-5, float(cutoff))
    H = np.exp(-(D**2) / (2.0 * (d0**2)))
    return H


def generate_butterworth_lpf(height: int, width: int, cutoff: float, order: int = 2) -> np.ndarray:
    """
    Butterworth Low-Pass Filter transfer function:
    H(u, v) = 1 / (1 + [D(u, v) / D0]^(2*n))
    Controlled transition bandwidth governed by order n.
    """
    D, _, _ = create_distance_matrix(height, width)
    d0 = max(1e-5, float(cutoff))
    n = max(1, int(order))
    H = 1.0 / (1.0 + (D / d0)**(2 * n))
    return H


def generate_notch_reject_filter(
    height: int,
    width: int,
    notches: List[Dict[str, float]],
    order: int = 2
) -> np.ndarray:
    """
    Butterworth Notch Reject Filter for periodic noise attenuation:
    H(u, v) = Product_k [ 1 / (1 + (D0^2 / (D_k * D_-k)) ^ n) ]
    where D_k = sqrt((U - uk)^2 + (V - vk)^2)
          D_-k = sqrt((U + uk)^2 + (V + vk)^2)
    """
    _, Y, X = create_distance_matrix(height, width)
    H = np.ones((height, width), dtype=np.float64)
    n = max(1, int(order))
    
    for notch in notches:
        u_k = notch.get("u", 0.0)
        v_k = notch.get("v", 0.0)
        d0 = max(1.0, notch.get("radius", 15.0))
        
        # Distance to positive and negative symmetric notch centers
        D_k = np.sqrt((X - u_k)**2 + (Y - v_k)**2)
        D_neg_k = np.sqrt((X + u_k)**2 + (Y + v_k)**2)
        
        # Avoid division by zero
        denom = (D_k * D_neg_k)
        denom = np.where(denom < 1e-6, 1e-6, denom)
        
        H_k = 1.0 / (1.0 + (d0**2 / denom)**n)
        H *= H_k
        
    return H


def apply_frequency_filter(
    image: np.ndarray,
    filter_type: str = "gaussian",
    cutoff: float = 40.0,
    order: int = 2,
    notches: Optional[List[Dict[str, float]]] = None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, float, Dict[str, Any]]:
    """
    Full 2-D Frequency Domain Filtering Pipeline:
    1. Grayscale Conversion (if needed)
    2. 2-D FFT: F = np.fft.fft2(img)
    3. Shift zero-frequency to center: F_shift = np.fft.fftshift(F)
    4. Generate Filter Mask H(u, v)
    5. Filtered Spectrum: G_shift = F_shift * H
    6. Inverse Shift: G = np.fft.ifftshift(G_shift)
    7. 2-D Inverse FFT: g = np.fft.ifft2(G)
    8. Reconstruct Spatial Denoised Image: real(g) clipped to [0, 255]

    Returns:
    - reconstructed_image (np.uint8)
    - input_magnitude_spectrum (np.uint8)
    - filter_mask_visualization (np.uint8)
    - filtered_magnitude_spectrum (np.uint8)
    - execution_time_ms (float)
    - metadata (dict)
    """
    start_time = time.perf_counter()

    # Step 1: Ensure grayscale for 2D DSP representation
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    h, w = gray.shape

    # Step 2: 2-D Fast Fourier Transform
    F = np.fft.fft2(gray.astype(np.float64))

    # Step 3: Shift zero-frequency DC component to center of spectrum
    F_shift = np.fft.fftshift(F)
    input_spectrum_vis = compute_log_magnitude_spectrum(F_shift)

    # Step 4: Generate Frequency Domain Filter Mask H(u, v)
    f_type = filter_type.lower()
    if f_type == "ideal":
        H = generate_ideal_lpf(h, w, cutoff)
        filter_name = "Ideal Low-Pass Filter"
    elif f_type == "butterworth":
        H = generate_butterworth_lpf(h, w, cutoff, order)
        filter_name = f"Butterworth Low-Pass Filter (Order {order})"
    elif f_type == "notch":
        # Notch reject filter
        notch_list = notches if notches else [{"u": 15.0, "v": 15.0, "radius": 12.0}]
        H = generate_notch_reject_filter(h, w, notch_list, order)
        filter_name = "Notch Reject Filter"
    else: # default gaussian
        H = generate_gaussian_lpf(h, w, cutoff)
        filter_name = "Gaussian Low-Pass Filter"

    # Step 5: Frequency domain point-wise multiplication G = F * H
    G_shift = F_shift * H
    filtered_spectrum_vis = compute_log_magnitude_spectrum(G_shift)

    # Step 6: Inverse shift zero-frequency back to corners
    G = np.fft.ifftshift(G_shift)

    # Step 7: 2-D Inverse Fast Fourier Transform
    g = np.fft.ifft2(G)

    # Step 8: Reconstruct denoised spatial image (extract real part and clip)
    reconstructed = np.real(g)
    reconstructed = np.clip(reconstructed, 0, 255).astype(np.uint8)

    # Filter mask visualization [0, 255]
    mask_vis = (H * 255.0).astype(np.uint8)

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    metadata = {
        "filter_type": f_type,
        "filter_name": filter_name,
        "cutoff_frequency": cutoff,
        "order": order if f_type in ["butterworth", "notch"] else None,
        "notches": notches if f_type == "notch" else None,
        "dimensions": f"{w}x{h}",
        "method": "2-D Discrete Fourier Transform (FFT2 / IFFT2)"
    }

    return reconstructed, input_spectrum_vis, mask_vis, filtered_spectrum_vis, round(elapsed_ms, 2), metadata
