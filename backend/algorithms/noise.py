"""
Noise Generation Module for 2-D Digital Signal Processing
Supports programmatic noise synthesis:
- Additive White Gaussian Noise (AWGN)
- Salt-and-Pepper (Impulse) Noise
- Speckle (Multiplicative) Noise
- Periodic (Sinusoidal Interference) Noise
"""

import numpy as np
from typing import Optional, Tuple


def add_gaussian_noise(
    image: np.ndarray,
    mean: float = 0.0,
    sigma: float = 25.0,
    intensity: float = 1.0,
    seed: Optional[int] = None
) -> Tuple[np.ndarray, dict]:
    """
    Adds Gaussian Noise to an image:
    I_noisy(x, y) = clip(I(x, y) + intensity * N(mean, sigma^2), 0, 255)
    """
    if seed is not None:
        rng = np.random.default_rng(seed)
    else:
        rng = np.random.default_rng()

    img_float = image.astype(np.float64)
    # Generate Gaussian distribution
    gauss = rng.normal(loc=mean, scale=sigma, size=image.shape) * intensity
    noisy_img = np.clip(img_float + gauss, 0, 255).astype(np.uint8)

    params = {
        "type": "gaussian",
        "mean": mean,
        "sigma": sigma,
        "intensity": intensity,
        "seed": seed
    }
    return noisy_img, params


def add_salt_and_pepper_noise(
    image: np.ndarray,
    density: float = 0.05,
    salt_ratio: float = 0.5,
    seed: Optional[int] = None
) -> Tuple[np.ndarray, dict]:
    """
    Adds Salt-and-Pepper (impulse) noise:
    Density: fraction of pixels affected.
    salt_ratio: proportion of affected pixels that become Salt (255) vs Pepper (0).
    """
    if seed is not None:
        rng = np.random.default_rng(seed)
    else:
        rng = np.random.default_rng()

    noisy_img = image.copy()
    
    # Generate random matrix with same height and width
    h, w = image.shape[:2]
    num_pixels = h * w
    num_noisy = int(density * num_pixels)
    
    # Random pixel coordinates
    coords_y = rng.integers(0, h, num_noisy)
    coords_x = rng.integers(0, w, num_noisy)
    
    # Decide which are salt and which are pepper
    num_salt = int(num_noisy * salt_ratio)
    
    # Salt (255)
    if len(image.shape) == 3:
        noisy_img[coords_y[:num_salt], coords_x[:num_salt], :] = 255
        noisy_img[coords_y[num_salt:], coords_x[num_salt:], :] = 0
    else:
        noisy_img[coords_y[:num_salt], coords_x[:num_salt]] = 255
        noisy_img[coords_y[num_salt:], coords_x[num_salt]] = 0

    pepper_ratio = 1.0 - salt_ratio
    params = {
        "type": "salt_and_pepper",
        "density": density,
        "salt_ratio": salt_ratio,
        "pepper_ratio": round(pepper_ratio, 3),
        "seed": seed
    }
    return noisy_img, params


def add_speckle_noise(
    image: np.ndarray,
    variance: float = 0.05,
    seed: Optional[int] = None
) -> Tuple[np.ndarray, dict]:
    """
    Speckle (multiplicative) noise:
    I_noisy = I + I * n, where n ~ N(0, variance)
    Often found in radar, sonar, and ultrasound imaging.
    """
    if seed is not None:
        rng = np.random.default_rng(seed)
    else:
        rng = np.random.default_rng()

    img_float = image.astype(np.float64) / 255.0
    sigma = np.sqrt(max(variance, 1e-6))
    noise = rng.normal(0, sigma, size=image.shape)
    
    noisy_img = img_float + img_float * noise
    noisy_img = np.clip(noisy_img * 255.0, 0, 255).astype(np.uint8)

    params = {
        "type": "speckle",
        "variance": variance,
        "sigma": round(float(sigma), 4),
        "seed": seed
    }
    return noisy_img, params


def add_periodic_noise(
    image: np.ndarray,
    frequency: float = 15.0,
    amplitude: float = 35.0,
    angle_degrees: float = 45.0,
    seed: Optional[int] = None
) -> Tuple[np.ndarray, dict]:
    """
    Adds 2-D Sinusoidal Periodic Interference Noise:
    I_noisy(x, y) = clip(I(x, y) + A * sin(2*pi*(u0*x/M + v0*y/N)), 0, 255)
    In the 2-D Fourier spectrum, this manifests as bright symmetric conjugate impulses!
    """
    h, w = image.shape[:2]
    
    # Calculate frequency components u0, v0 based on angle and spatial frequency
    theta = np.deg2rad(angle_degrees)
    u0 = frequency * np.cos(theta)
    v0 = frequency * np.sin(theta)
    
    # Create coordinate grid
    y, x = np.mgrid[0:h, 0:w]
    
    # Sinusoidal wave pattern
    wave = amplitude * np.sin(2 * np.pi * (u0 * x / w + v0 * y / h))
    
    img_float = image.astype(np.float64)
    if len(image.shape) == 3:
        # Broadcast across channels
        wave = wave[:, :, np.newaxis]
        
    noisy_img = np.clip(img_float + wave, 0, 255).astype(np.uint8)
    
    params = {
        "type": "periodic",
        "frequency": frequency,
        "amplitude": amplitude,
        "angle_degrees": angle_degrees,
        "u0_component": round(float(u0), 2),
        "v0_component": round(float(v0), 2),
        "seed": seed
    }
    return noisy_img, params
