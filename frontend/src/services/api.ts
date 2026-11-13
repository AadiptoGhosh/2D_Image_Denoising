import axios from 'axios';
import {
  ImageSession,
  SampleImage,
  NoiseParams,
  SpatialFilterParams,
  FrequencyFilterParams,
  FrequencyFilterResponse,
  BenchmarkResponse,
  Metrics
} from '../types/dsp';

// Resolve API base URL using Vite environment variable
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
// Normalize base URL: strip trailing slashes and optional redundant trailing '/api'
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async checkHealth(): Promise<{ status: string; engine: string }> {
    const res = await apiClient.get('/api/health');
    return res.data;
  },

  async uploadImage(file: File): Promise<ImageSession> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ImageSession>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getSamples(): Promise<SampleImage[]> {
    const res = await apiClient.get<{ samples: SampleImage[] }>('/api/samples');
    return res.data.samples;
  },

  async loadSample(sampleId: string): Promise<ImageSession> {
    const res = await apiClient.post<ImageSession>('/api/load-sample', { sample_id: sampleId });
    return res.data;
  },

  async applyNoise(params: { session_id: string } & Partial<NoiseParams>): Promise<{
    session_id: string;
    noisy_image: string;
    noise_params: Record<string, any>;
    metrics: Metrics;
  }> {
    const res = await apiClient.post('/api/noise', params);
    return res.data;
  },

  async resetToOriginal(sessionId: string): Promise<{
    session_id: string;
    original_image: string;
    noisy_image: string;
    metrics: Metrics;
  }> {
    const res = await apiClient.post('/api/reset', { session_id: sessionId });
    return res.data;
  },

  async applySpatialFilter(params: { session_id: string } & Partial<SpatialFilterParams>): Promise<{
    session_id: string;
    filtered_image: string;
    filter_params: Record<string, any>;
    metrics: Metrics;
    execution_time_ms: number;
  }> {
    const res = await apiClient.post('/api/spatial-filter', params);
    return res.data;
  },

  async applyFrequencyFilter(params: { session_id: string } & Partial<FrequencyFilterParams>): Promise<FrequencyFilterResponse> {
    const res = await apiClient.post<FrequencyFilterResponse>('/api/frequency-filter', params);
    return res.data;
  },

  async evaluateImage(sessionId: string, targetType: 'noisy' | 'filtered'): Promise<{
    session_id: string;
    target_type: string;
    metrics: Metrics;
  }> {
    const res = await apiClient.post('/api/evaluate', {
      session_id: sessionId,
      target_type: targetType,
    });
    return res.data;
  },

  async runBatchEvaluation(sessionId: string): Promise<BenchmarkResponse> {
    const res = await apiClient.post<BenchmarkResponse>('/api/batch-evaluate', {
      session_id: sessionId,
    });
    return res.data;
  },
};
