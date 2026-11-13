"""
Image I/O and Conversion Utilities
Provides helper methods for:
- Base64 encoding / decoding of NumPy images
- Synthetic benchmark test image generation (Cameraman, Geometric Frequency Chart, Checkerboard)
- Image format validation
"""

import base64
import cv2
import numpy as np
from typing import Tuple, Optional


def numpy_to_base64(image: np.ndarray, format: str = ".png") -> str:
    """
    Encodes a NumPy image array to a data URL base64 string.
    """
    success, encoded_img = cv2.imencode(format, image)
    if not success:
        raise ValueError("Failed to encode image to base64")
    
    b64_str = base64.b64encode(encoded_img.tobytes()).decode("utf-8")
    mime = "image/png" if format.lower() == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64_str}"


def base64_to_numpy(base64_str: str) -> np.ndarray:
    """
    Decodes a base64 string or data URL to a NumPy image array (BGR or Grayscale).
    """
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError("Invalid image data in base64 string")
    return img


def generate_benchmark_test_pattern(pattern_type: str = "geometric", size: int = 512) -> np.ndarray:
    """
    Generates high-contrast mathematical DSP test benchmark images:
    - 'geometric': Concentric circles, radial frequency spokes, Siemens star, and chirp signals
    - 'checkerboard': Precision sharp edges for edge-preservation filtering evaluation
    - 'gradient_shapes': Rectangles, circles, and smooth gradients for dynamic range tests
    """
    h, w = size, size
    y, x = np.mgrid[0:h, 0:w]
    cx, cy = w / 2.0, h / 2.0

    if pattern_type == "geometric":
        # Chirp / Siemens Star test pattern with variable spatial frequencies
        r = np.sqrt((x - cx)**2 + (y - cy)**2)
        theta = np.arctan2(y - cy, x - cx)
        
        # Radial frequency sweep + concentric rings
        spokes = np.cos(16 * theta)
        rings = np.cos(2 * np.pi * (r**1.5) / 120.0)
        combined = 0.5 * (spokes * rings + 1.0) * 255.0
        
        img = np.clip(combined, 0, 255).astype(np.uint8)
        # Add border
        cv2.rectangle(img, (10, 10), (w - 10, h - 10), 255, 2)
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    elif pattern_type == "checkerboard":
        # 16x16 grid checkerboard
        square_size = size // 16
        checker = ((x // square_size) + (y // square_size)) % 2
        img = (checker * 255).astype(np.uint8)
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    elif pattern_type == "synthetic_landscape":
        # Gradient background with overlapping shapes and fine textures
        gradient = (y / h * 180.0 + 30.0).astype(np.uint8)
        img = cv2.cvtColor(gradient, cv2.COLOR_GRAY2BGR)
        
        # Add high-contrast geometric objects
        cv2.circle(img, (int(w * 0.75), int(h * 0.3)), 50, (240, 240, 240), -1)
        cv2.rectangle(img, (int(w * 0.15), int(h * 0.5)), (int(w * 0.45), int(h * 0.85)), (40, 40, 40), -1)
        
        # Add fine grid lines for frequency resolution testing
        for i in range(int(w * 0.55), int(w * 0.85), 6):
            cv2.line(img, (i, int(h * 0.55)), (i, int(h * 0.85)), (200, 200, 200), 1)
            
        return img

    else:
        # Default smooth Gaussian intensity disc
        r = np.sqrt((x - cx)**2 + (y - cy)**2)
        disc = np.exp(-(r**2) / (2 * (size / 4)**2)) * 255.0
        img = np.clip(disc, 0, 255).astype(np.uint8)
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
