"""
Image Quality and Performance Metrics Module
Calculates objective fidelity metrics:
- Mean Squared Error (MSE)
- Peak Signal-to-Noise Ratio (PSNR)
- Structural Similarity Index Measure (SSIM)
- Execution Latency (ms)

Also includes dynamic scientific interpretation generation based on actual metric scores.
"""

import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim_func
from typing import Dict, Any, List, Optional, Tuple


def match_image_formats(ref: np.ndarray, target: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Ensures both reference and target images have matching spatial dimensions and channel counts.
    If one is grayscale and the other color, converts the color image to grayscale.
    """
    # Align dimensions if necessary
    if ref.shape[:2] != target.shape[:2]:
        target = cv2.resize(target, (ref.shape[1], ref.shape[0]), interpolation=cv2.INTER_AREA)

    # Check channels
    ref_channels = 1 if len(ref.shape) == 2 else ref.shape[2]
    tgt_channels = 1 if len(target.shape) == 2 else target.shape[2]

    if ref_channels != tgt_channels:
        if ref_channels == 3 and tgt_channels == 1:
            ref_conv = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
            return ref_conv, target
        elif ref_channels == 1 and tgt_channels == 3:
            tgt_conv = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
            return ref, tgt_conv
            
    return ref, target


def compute_metrics(
    reference: np.ndarray,
    target: np.ndarray,
    execution_time_ms: float = 0.0
) -> Dict[str, Any]:
    """
    Computes exact MSE, PSNR, and SSIM between reference (clean) and target (noisy/filtered) images.
    """
    ref_matched, tgt_matched = match_image_formats(reference, target)

    ref_f = ref_matched.astype(np.float64)
    tgt_f = tgt_matched.astype(np.float64)

    # A. Mean Squared Error (MSE)
    # MSE = (1 / MN) * Sum[ (I(x,y) - K(x,y))^2 ]
    diff = ref_f - tgt_f
    mse = float(np.mean(diff ** 2))

    # B. Peak Signal-to-Noise Ratio (PSNR)
    # PSNR = 10 * log10( MAX_I^2 / MSE )
    max_val = 255.0
    if mse < 1e-10:
        psnr = 100.0  # Perfect reconstruction indicator (inf mathematically)
        is_identical = True
    else:
        psnr = float(10.0 * np.log10((max_val ** 2) / mse))
        is_identical = False

    # C. Structural Similarity Index Measure (SSIM)
    is_color = len(ref_matched.shape) == 3 and ref_matched.shape[2] == 3
    if is_color:
        ssim_val = float(ssim_func(
            ref_matched,
            tgt_matched,
            channel_axis=2,
            data_range=255.0
        ))
    else:
        ssim_val = float(ssim_func(
            ref_matched,
            tgt_matched,
            data_range=255.0
        ))

    return {
        "mse": round(mse, 4),
        "psnr": round(psnr, 2),
        "ssim": round(ssim_val, 4),
        "execution_time_ms": round(execution_time_ms, 2),
        "is_identical": is_identical
    }


def generate_scientific_interpretation(
    noise_type: str,
    noisy_metrics: Dict[str, Any],
    results: List[Dict[str, Any]]
) -> str:
    """
    Generates a rigorous, context-aware scientific interpretation of experimental results.
    Compares the evaluated filters against the noisy baseline and against each other.
    """
    if not results:
        return "No filtering results available for comparative interpretation."

    # Sort results by PSNR descending
    valid_results = [r for r in results if r.get("metrics")]
    if not valid_results:
        return "Insufficient metric data to generate interpretation."

    sorted_by_psnr = sorted(valid_results, key=lambda x: x["metrics"]["psnr"], reverse=True)
    sorted_by_ssim = sorted(valid_results, key=lambda x: x["metrics"]["ssim"], reverse=True)
    sorted_by_time = sorted(valid_results, key=lambda x: x["metrics"]["execution_time_ms"])

    best_psnr_filter = sorted_by_psnr[0]
    best_ssim_filter = sorted_by_ssim[0]
    fastest_filter = sorted_by_time[0]

    baseline_psnr = noisy_metrics.get("psnr", 0.0)
    baseline_ssim = noisy_metrics.get("ssim", 0.0)
    baseline_mse = noisy_metrics.get("mse", 0.0)

    best_psnr_gain = best_psnr_filter["metrics"]["psnr"] - baseline_psnr
    best_ssim_gain = best_ssim_filter["metrics"]["ssim"] - baseline_ssim

    noise_label = noise_type.replace("_", " ").title()
    
    # Domain-specific physical explanation
    domain_reasoning = ""
    if "salt" in noise_type.lower():
        domain_reasoning = (
            "Salt-and-Pepper noise introduces extreme intensity outliers (0 and 255). "
            "Linear averaging filters (Mean, Gaussian) smear these extreme values into neighboring pixels, "
            "often degrading edge sharpness. In contrast, non-linear rank-order filters (Median Filter) "
            "statistically eliminate impulse spikes by replacing them with the neighborhood median, "
            "delivering superior structural fidelity."
        )
    elif "periodic" in noise_type.lower():
        domain_reasoning = (
            "Periodic noise manifests as discrete conjugate sinusoidal harmonics in the 2-D Fourier spectrum. "
            "Spatial spatial-domain convolution filters attenuate the overall high-frequency content uniformly, "
            "whereas 2-D Frequency Domain filtering (specifically Notch Reject or calibrated Low-Pass filters) "
            "targets the exact spectral peaks corresponding to the interference frequency, effectively purifying "
            "the signal while preserving essential image texture."
        )
    elif "speckle" in noise_type.lower():
        domain_reasoning = (
            "Speckle noise is a multiplicative signal-dependent degradation model common in coherent imaging. "
            "Bilateral and Gaussian filtering effectively suppress the localized multiplicative variance "
            "while maintaining dominant boundary structures."
        )
    else:  # Gaussian
        domain_reasoning = (
            "Additive White Gaussian Noise (AWGN) has an evenly distributed spectral density. "
            "Bilateral filtering excels by decoupling geometric spatial distance from photometric intensity "
            "differences, preventing blurring across sharp boundaries, while Gaussian LPF provides optimal "
            "energy compaction in the frequency spectrum without introducing Gibbs ringing artifacts."
        )

    interpretation = (
        f"### Experimental Analysis Summary ({noise_label} Noise)\n\n"
        f"1. **Baseline Degradation**: The untreated noisy image recorded a baseline PSNR of **{baseline_psnr:.2f} dB**, "
        f"an SSIM of **{baseline_ssim:.4f}**, and an MSE of **{baseline_mse:.2f}**.\n\n"
        f"2. **Top Performing Algorithm**: **{best_psnr_filter.get('name', 'Filter')}** achieved the highest objective reconstruction quality, "
        f"attaining a PSNR of **{best_psnr_filter['metrics']['psnr']:.2f} dB** (+{best_psnr_gain:.2f} dB gain) "
        f"and an SSIM of **{best_psnr_filter['metrics']['ssim']:.4f}** (+{best_ssim_gain:.4f} gain).\n\n"
        f"3. **DSP Theoretical Insight**: {domain_reasoning}\n\n"
        f"4. **Computational Latency**: **{fastest_filter.get('name', 'Filter')}** demonstrated the lowest execution latency at "
        f"**{fastest_filter['metrics']['execution_time_ms']:.2f} ms**, presenting an attractive trade-off between throughput and restoration precision."
    )

    return interpretation
