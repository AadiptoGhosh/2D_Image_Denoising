import React from 'react';
import { Metrics } from '../types/dsp';
import { Clock, ShieldCheck, Zap, Gauge } from 'lucide-react';

interface MetricBadgeProps {
  metrics: Metrics;
  compact?: boolean;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({ metrics, compact = false }) => {
  const getPsnrColor = (psnr: number) => {
    if (psnr >= 32) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (psnr >= 25) return 'bg-sky-50 text-sky-800 border-sky-200';
    if (psnr >= 20) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const getSsimColor = (ssim: number) => {
    if (ssim >= 0.85) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (ssim >= 0.70) return 'bg-sky-50 text-sky-800 border-sky-200';
    if (ssim >= 0.50) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        <span 
          className={`px-2 py-0.5 rounded border font-semibold ${getPsnrColor(metrics.psnr)}`}
          title="Peak Signal-to-Noise Ratio (Higher is better)"
        >
          PSNR: {metrics.is_identical ? '100 dB (exact)' : `${metrics.psnr.toFixed(2)} dB`}
        </span>
        <span 
          className={`px-2 py-0.5 rounded border font-semibold ${getSsimColor(metrics.ssim)}`}
          title="Structural Similarity Index (1.0 is identical)"
        >
          SSIM: {metrics.ssim.toFixed(4)}
        </span>
        <span 
          className="px-2 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200"
          title="Mean Squared Error (Lower is better)"
        >
          MSE: {metrics.mse.toFixed(2)}
        </span>
        {metrics.execution_time_ms > 0 && (
          <span 
            className="px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1"
            title="Algorithm Execution Latency"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            {metrics.execution_time_ms.toFixed(1)} ms
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
      {/* PSNR */}
      <div className={`p-2 rounded-lg border text-left ${getPsnrColor(metrics.psnr)}`}>
        <div className="flex items-center justify-between text-[11px] font-medium opacity-80 mb-0.5">
          <span>PSNR</span>
          <Gauge className="w-3 h-3" />
        </div>
        <div className="text-base font-bold font-mono">
          {metrics.is_identical ? '∞ (Exact)' : `${metrics.psnr.toFixed(2)} dB`}
        </div>
        <div className="text-[10px] opacity-75">Peak Signal-to-Noise</div>
      </div>

      {/* SSIM */}
      <div className={`p-2 rounded-lg border text-left ${getSsimColor(metrics.ssim)}`}>
        <div className="flex items-center justify-between text-[11px] font-medium opacity-80 mb-0.5">
          <span>SSIM</span>
          <ShieldCheck className="w-3 h-3" />
        </div>
        <div className="text-base font-bold font-mono">
          {metrics.ssim.toFixed(4)}
        </div>
        <div className="text-[10px] opacity-75">Structural Fidelity [0-1]</div>
      </div>

      {/* MSE */}
      <div className="p-2 rounded-lg border bg-slate-50 text-slate-800 border-slate-200 text-left">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-0.5">
          <span>MSE</span>
          <Zap className="w-3 h-3" />
        </div>
        <div className="text-base font-bold font-mono">
          {metrics.mse.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500">Mean Squared Error</div>
      </div>

      {/* Execution Time */}
      <div className="p-2 rounded-lg border bg-slate-50 text-slate-800 border-slate-200 text-left">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-0.5">
          <span>Latency</span>
          <Clock className="w-3 h-3" />
        </div>
        <div className="text-base font-bold font-mono">
          {metrics.execution_time_ms > 0 ? `${metrics.execution_time_ms.toFixed(1)} ms` : '—'}
        </div>
        <div className="text-[10px] text-slate-500">Processing Time</div>
      </div>
    </div>
  );
};
