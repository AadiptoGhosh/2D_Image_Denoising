import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeOverview } from './pages/HomeOverview';
import { ImageLab } from './pages/ImageLab';
import { SpatialFiltering } from './pages/SpatialFiltering';
import { FrequencyFiltering } from './pages/FrequencyFiltering';
import { PerformanceAnalysis } from './pages/PerformanceAnalysis';
import { AboutTheory } from './pages/AboutTheory';

import { api } from './services/api';
import { 
  ImageSession, 
  SampleImage, 
  NoiseParams, 
  SpatialFilterParams, 
  FrequencyFilterParams, 
  FrequencyFilterResponse, 
  BenchmarkResponse 
} from './types/dsp';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [session, setSession] = useState<ImageSession | null>(null);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [frequencyResult, setFrequencyResult] = useState<FrequencyFilterResponse | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null);
  
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check health and initialize default sample on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await api.checkHealth();
        setIsBackendHealthy(health.status === 'healthy');
        
        // Fetch samples
        const sampleList = await api.getSamples();
        setSamples(sampleList);

        // Auto-load Cameraman as default initial image
        try {
          const defaultSession = await api.loadSample('cameraman');
          setSession(defaultSession);
        } catch (e) {
          console.warn('Could not auto-load default sample:', e);
        }
      } catch (err) {
        console.error('Backend health check failed:', err);
        setIsBackendHealthy(false);
      }
    };

    initApp();
  }, []);

  // Handlers
  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const newSession = await api.uploadImage(file);
      setSession(newSession);
      setFrequencyResult(null);
      setBenchmarkData(null);
      showToast(`Uploaded "${file.name}" (${newSession.dimensions})`, 'success');
      setActiveTab('lab');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to upload image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async (sampleId: string) => {
    setIsLoading(true);
    try {
      const newSession = await api.loadSample(sampleId);
      setSession(newSession);
      setFrequencyResult(null);
      setBenchmarkData(null);
      showToast(`Loaded academic benchmark "${newSession.filename}"`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to load sample image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyNoise = async (params: Partial<NoiseParams>) => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await api.applyNoise({
        session_id: session.session_id,
        ...params,
      });

      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          noisy_image: res.noisy_image,
          last_filtered_image: undefined,
          metrics: res.metrics,
        };
      });
      setFrequencyResult(null);
      setBenchmarkData(null);
      showToast(`Applied ${params.noise_type?.replace('_', ' ')} noise. PSNR: ${res.metrics.psnr.toFixed(2)} dB`, 'info');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to generate noise', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await api.resetToOriginal(session.session_id);
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          noisy_image: res.noisy_image,
          last_filtered_image: undefined,
          metrics: res.metrics,
        };
      });
      setFrequencyResult(null);
      setBenchmarkData(null);
      showToast('Reset image to clean original reference state.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to reset image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySpatialFilter = async (params: Partial<SpatialFilterParams>) => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await api.applySpatialFilter({
        session_id: session.session_id,
        ...params,
      });

      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          last_filtered_image: res.filtered_image,
          metrics: res.metrics,
        };
      });
      showToast(
        `Applied ${res.filter_params?.name || 'Spatial Filter'} (${res.execution_time_ms.toFixed(1)} ms). PSNR: ${res.metrics.psnr.toFixed(2)} dB`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to apply spatial filter', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFrequencyFilter = async (params: Partial<FrequencyFilterParams>): Promise<FrequencyFilterResponse | null> => {
    if (!session) return null;
    setIsLoading(true);
    try {
      const res = await api.applyFrequencyFilter({
        session_id: session.session_id,
        ...params,
      });

      setFrequencyResult(res);
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          last_filtered_image: res.filtered_image,
          metrics: res.metrics,
        };
      });
      showToast(
        `Computed 2-D FFT & ${res.filter_params?.filter_name} (${res.execution_time_ms.toFixed(1)} ms). PSNR: ${res.metrics.psnr.toFixed(2)} dB`,
        'success'
      );
      return res;
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to apply frequency filter', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const data = await api.runBatchEvaluation(session.session_id);
      setBenchmarkData(data);
      showToast(`Evaluated ${data.results.length} algorithms across objective metrics.`, 'success');
      setActiveTab('analysis');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to run benchmark suite', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
        hasActiveSession={!!session}
        activeFilename={session?.filename}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-emerald-400 border-slate-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-sky-300 border-slate-700'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <HomeOverview
            onStartExperiment={() => setActiveTab('lab')}
            onExploreTheory={() => setActiveTab('about')}
            onSelectSample={async (sampleId) => {
              await handleLoadSample(sampleId);
              setActiveTab('lab');
            }}
          />
        )}

        {activeTab === 'lab' && (
          <ImageLab
            session={session}
            samples={samples}
            onUpload={handleUpload}
            onLoadSample={handleLoadSample}
            onApplyNoise={handleApplyNoise}
            onReset={handleReset}
            onNavigateToSpatial={() => setActiveTab('spatial')}
            onNavigateToFrequency={() => setActiveTab('frequency')}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'spatial' && (
          <SpatialFiltering
            session={session}
            onApplySpatialFilter={handleApplySpatialFilter}
            onNavigateToAnalysis={() => setActiveTab('analysis')}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'frequency' && (
          <FrequencyFiltering
            session={session}
            onApplyFrequencyFilter={handleApplyFrequencyFilter}
            frequencyResult={frequencyResult}
            onNavigateToAnalysis={() => setActiveTab('analysis')}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'analysis' && (
          <PerformanceAnalysis
            session={session}
            benchmarkData={benchmarkData}
            onRunBenchmark={handleRunBenchmark}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'about' && <AboutTheory />}
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">DSP Image Lab</span>
            <span>—</span>
            <span>2-D Digital Signal Processing & Image Restoration</span>
          </div>

          <div className="flex items-center gap-4">
            <span>ECE Academic Laboratory Project</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="font-mono text-[11px] text-slate-400">NumPy · SciPy · OpenCV · scikit-image</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
