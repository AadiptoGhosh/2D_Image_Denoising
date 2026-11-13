export interface Metrics {
  mse: number;
  psnr: number;
  ssim: number;
  execution_time_ms: number;
  is_identical: boolean;
}

export interface ImageSession {
  session_id: string;
  filename: string;
  width: number;
  height: number;
  channels: number;
  dimensions: string;
  original_image: string;
  noisy_image: string;
  last_filtered_image?: string;
  metrics: Metrics;
}

export interface SampleImage {
  id: string;
  name: string;
  description: string;
}

export type NoiseType = 'gaussian' | 'salt_and_pepper' | 'speckle' | 'periodic';

export interface NoiseParams {
  noise_type: NoiseType;
  mean: number;
  sigma: number;
  intensity: number;
  density: number;
  salt_ratio: number;
  variance: number;
  frequency: number;
  amplitude: number;
  angle_degrees: number;
  seed: number | null;
}

export type SpatialFilterType = 'mean' | 'gaussian' | 'median' | 'bilateral';

export interface SpatialFilterParams {
  filter_name: SpatialFilterType;
  kernel_size: number;
  sigma: number;
  diameter: number;
  sigma_color: number;
  sigma_space: number;
}

export type FrequencyFilterType = 'ideal' | 'gaussian' | 'butterworth' | 'notch';

export interface FrequencyFilterParams {
  filter_name: FrequencyFilterType;
  cutoff: number;
  order: number;
  notches?: Array<{ u: number; v: number; radius: number }>;
}

export interface FrequencyFilterResponse {
  session_id: string;
  filtered_image: string;
  input_spectrum: string;
  filter_mask: string;
  filtered_spectrum: string;
  filter_params: Record<string, any>;
  metrics: Metrics;
  execution_time_ms: number;
}

export interface BenchmarkItem {
  id: string;
  name: string;
  category: 'Spatial' | 'Frequency';
  description: string;
  metrics: Metrics;
  thumbnail: string;
}

export interface BenchmarkResponse {
  session_id: string;
  noise_type: string;
  noise_metadata: Record<string, any>;
  baseline_metrics: Metrics;
  results: BenchmarkItem[];
  interpretation: string;
}
