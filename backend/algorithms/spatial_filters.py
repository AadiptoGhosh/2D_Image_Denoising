"""
Spatial Domain Filtering Module
Implements standard linear and non-linear 2-D spatial domain filters:
1. Mean (Box) Filter
2. Gaussian Filter
3. Median Filter
4. Bilateral Filter
"""

import time
import cv2
import numpy as np
from typing import Tuple, Dict, Any


def apply_mean_filter(
    image: np.ndarray,
    kernel_size: int = 3
) -> Tuple[np.ndarray, float, Dict[str, Any]]:
    """
    Mean Filter (Linear Averaging):
    Replaces each pixel with the arithmetic mean of its kernel neighborhood.
    h(x, y) = 1 / (K * K) * 1_{K x K}
    """
    # Ensure kernel size is odd and >= 3
    k = max(3, kernel_size if kernel_size % 2 != 0 else kernel_size + 1)
    
    start_time = time.perf_counter()
    filtered_img = cv2.blur(image, (k, k))
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    params = {
        "filter": "mean",
        "name": "Mean (Box) Filter",
        "kernel_size": f"{k}x{k}",
        "k": k,
        "type": "Linear Spatial Filter"
    }
    return filtered_img, round(elapsed_ms, 2), params


def apply_gaussian_filter(
    image: np.ndarray,
    kernel_size: int = 5,
    sigma: float = 1.0
) -> Tuple[np.ndarray, float, Dict[str, Any]]:
    """
    Gaussian Filter (Weighted Spatial Averaging):
    G(x, y) = 1/(2*pi*sigma^2) * exp(-(x^2 + y^2)/(2*sigma^2))
    """
    k = max(3, kernel_size if kernel_size % 2 != 0 else kernel_size + 1)
    s = float(sigma) if sigma > 0 else 0.0

    start_time = time.perf_counter()
    filtered_img = cv2.GaussianBlur(image, (k, k), sigmaX=s, sigmaY=s)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    params = {
        "filter": "gaussian",
        "name": "Gaussian Filter",
        "kernel_size": f"{k}x{k}",
        "k": k,
        "sigma": round(s, 2),
        "type": "Linear Spatial Filter"
    }
    return filtered_img, round(elapsed_ms, 2), params


def apply_median_filter(
    image: np.ndarray,
    kernel_size: int = 3
) -> Tuple[np.ndarray, float, Dict[str, Any]]:
    """
    Median Filter (Non-linear Rank-Order Filter):
    Replaces each pixel with the median intensity in the local neighborhood.
    Extremely effective at removing Salt-and-Pepper impulse noise while preserving edges.
    """
    k = max(3, kernel_size if kernel_size % 2 != 0 else kernel_size + 1)

    start_time = time.perf_counter()
    filtered_img = cv2.medianBlur(image, k)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    params = {
        "filter": "median",
        "name": "Median Filter",
        "kernel_size": f"{k}x{k}",
        "k": k,
        "type": "Non-linear Rank-Order Filter"
    }
    return filtered_img, round(elapsed_ms, 2), params


def apply_bilateral_filter(
    image: np.ndarray,
    diameter: int = 9,
    sigma_color: float = 75.0,
    sigma_space: float = 75.0
) -> Tuple[np.ndarray, float, Dict[str, Any]]:
    """
    Bilateral Filter (Non-linear Edge-Preserving Filter):
    Weights pixels using both spatial closeness and radiometric (intensity/color) similarity.
    Smooths flat regions while preserving sharp transitions and edges.
    """
    d = max(1, int(diameter))
    sc = float(sigma_color)
    ss = float(sigma_space)

    start_time = time.perf_counter()
    # cv2.bilateralFilter works on 8-bit images (1 or 3 channels)
    filtered_img = cv2.bilateralFilter(image, d, sigmaColor=sc, sigmaSpace=ss)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    params = {
        "filter": "bilateral",
        "name": "Bilateral Filter",
        "diameter": d,
        "sigma_color": sc,
        "sigma_space": ss,
        "type": "Non-linear Edge-Preserving Filter"
    }
    return filtered_img, round(elapsed_ms, 2), params
