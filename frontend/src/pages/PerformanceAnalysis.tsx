import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  Award, 
  ShieldCheck, 
  Zap, 
  Clock, 
  FileText,
  HelpCircle,
  Layers,
  Radio
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell 
} from 'recharts';
import { ImageSession, BenchmarkResponse, BenchmarkItem } from '../types/dsp';
import { ImageZoomModal } from '../components/ImageZoomModal';

interface PerformanceAnalysisProps {
  session: ImageSession | null;
  benchmarkData: BenchmarkResponse | null;
  onRunBenchmark: () => Promise<void>;
  isLoading: boolean;
}

export const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({
  session,
  benchmarkData,
  onRunBenchmark,
  isLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Spatial' | 'Frequency'>('all');
  const [sortField, setSortField] = useState<'psnr' | 'ssim' | 'mse' | 'execution_time_ms'>('psnr');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  
  // Modal preview for thumbnails
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  if (!session) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Image Loaded</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please upload or select an image and apply noise before running performance benchmarks.
        </p>
      </div>
    );
  }

  const rawResults = benchmarkData?.results || [];
  const filteredResults = rawResults.filter((item) => 
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    const valA = a.metrics[sortField];
    const valB = b.metrics[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  // Find best performers
  const bestPsnrItem = rawResults.length > 0 
    ? [...rawResults].sort((a, b) => b.metrics.psnr - a.metrics.psnr)[0]
    : null;

  const bestSsimItem = rawResults.length > 0 
    ? [...rawResults].sort((a, b) => b.metrics.ssim - a.metrics.ssim)[0]
    : null;

  const fastestItem = rawResults.length > 0 
    ? [...rawResults].sort((a, b) => a.metrics.execution_time_ms - b.metrics.execution_time_ms)[0]
    : null;

  // Chart data formatting
  const chartData = sortedResults.map((item) => ({
    name: item.name.split(' (')[0], // Short name
    fullName: item.name,
    category: item.category,
    psnr: item.metrics.psnr,
    ssim: Number(item.metrics.ssim.toFixed(4)),
    mse: Number(item.metrics.mse.toFixed(2)),
    time: Number(item.metrics.execution_time_ms.toFixed(2)),
  }));

  // Baseline noisy metrics
  const baselinePsnr = benchmarkData?.baseline_metrics.psnr || session.metrics.psnr || 0;
  const baselineSsim = benchmarkData?.baseline_metrics.ssim || session.metrics.ssim || 0;

  const handleExportCSV = () => {
    if (!benchmarkData || rawResults.length === 0) return;
    const headers = ['Algorithm', 'Category', 'PSNR (dB)', 'SSIM', 'MSE', 'Execution Time (ms)'];
    const rows = rawResults.map((r) => [
      `"${r.name}"`,
      r.category,
      r.metrics.psnr,
      r.metrics.ssim,
      r.metrics.mse,
      r.metrics.execution_time_ms,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dsp_denoising_benchmark_${session.filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance & Fidelity Analysis</h2>
          <p className="text-sm text-slate-500">
            Compare all spatial and frequency-domain filtering algorithms across objective mathematical metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {benchmarkData && rawResults.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV Report</span>
            </button>
          )}

          <button
            onClick={onRunBenchmark}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Complete Benchmark Suite...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Complete Benchmark Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Summary Cards if Benchmark is Available */}
      {bestPsnrItem && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Best PSNR */}
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                Highest PSNR Score
              </div>
              <div className="text-base font-bold text-slate-900">{bestPsnrItem.name}</div>
              <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                {bestPsnrItem.metrics.psnr.toFixed(2)} dB{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  (+{(bestPsnrItem.metrics.psnr - baselinePsnr).toFixed(2)} dB gain)
                </span>
              </div>
            </div>
          </div>

          {/* Best SSIM */}
          <div className="bg-white rounded-xl border border-sky-200 p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">
                Highest Structural Fidelity (SSIM)
              </div>
              <div className="text-base font-bold text-slate-900">{bestSsimItem?.name}</div>
              <div className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                {bestSsimItem?.metrics.ssim.toFixed(4)}{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  (Baseline: {baselineSsim.toFixed(4)})
                </span>
              </div>
            </div>
          </div>

          {/* Fastest Filter */}
          <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                Fastest Execution Latency
              </div>
              <div className="text-base font-bold text-slate-900">{fastestItem?.name}</div>
              <div className="text-xs font-mono font-bold text-indigo-700 mt-0.5">
                {fastestItem?.metrics.execution_time_ms.toFixed(2)} ms
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Charts Section */}
      {benchmarkData && chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: PSNR Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">PSNR Comparison (Peak Signal-to-Noise Ratio)</h3>
                <p className="text-[11px] text-slate-500">Decibels (dB) — Higher indicates superior signal recovery</p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Baseline Noisy: {baselinePsnr.toFixed(1)} dB
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis 
                    domain={[Math.floor(Math.min(baselinePsnr, 15)), 'auto']}
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`${Number(value).toFixed(2)} dB`, 'PSNR']}
                  />
                  <ReferenceLine y={baselinePsnr} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Noisy Baseline', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="psnr" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fullName === bestPsnrItem?.name ? '#059669' : '#0284c7'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: SSIM Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">SSIM (Structural Similarity Index)</h3>
                <p className="text-[11px] text-slate-500">Range [0, 1] — 1.0 represents perfect structural fidelity</p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Baseline Noisy: {baselineSsim.toFixed(3)}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis 
                    domain={[0, 1.0]} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`${Number(value).toFixed(4)}`, 'SSIM']}
                  />
                  <ReferenceLine y={baselineSsim} stroke="#f43f5e" strokeDasharray="4 4" />
                  <Bar dataKey="ssim" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fullName === bestSsimItem?.name ? '#10b981' : '#4f46e5'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Mean Squared Error (MSE) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mean Squared Error (MSE)</h3>
                <p className="text-[11px] text-slate-500">Squared error per pixel — Lower is better</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`${Number(value).toFixed(2)}`, 'MSE']}
                  />
                  <Bar dataKey="mse" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Execution Latency (ms) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Execution Latency (Processing Time)</h3>
                <p className="text-[11px] text-slate-500">Milliseconds (ms) — Measures computational complexity</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`${Number(value).toFixed(2)} ms`, 'Latency']}
                  />
                  <Bar dataKey="time" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State before clicking benchmark */
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No Benchmark Results Generated Yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click "Run Complete Benchmark Suite" above to execute all spatial and frequency-domain filters on your current noisy image and compute real comparative metrics.
          </p>
          <button
            onClick={onRunBenchmark}
            disabled={isLoading}
            className="mt-4 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Benchmark Now</span>
          </button>
        </div>
      )}

      {/* Comprehensive Results Table */}
      {benchmarkData && sortedResults.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Detailed Algorithm Metric Matrix</h3>
              <p className="text-xs text-slate-500">Click headers to sort or filter by algorithm category</p>
            </div>

            {/* Filter category tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['all', 'Spatial', 'Frequency'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Filters' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Algorithm Name</th>
                  <th className="py-3 px-4">Domain</th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-sky-700"
                    onClick={() => { setSortField('psnr'); setSortAsc(sortField === 'psnr' ? !sortAsc : false); }}
                  >
                    PSNR (dB) {sortField === 'psnr' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-sky-700"
                    onClick={() => { setSortField('ssim'); setSortAsc(sortField === 'ssim' ? !sortAsc : false); }}
                  >
                    SSIM {sortField === 'ssim' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-sky-700"
                    onClick={() => { setSortField('mse'); setSortAsc(sortField === 'mse' ? !sortAsc : true); }}
                  >
                    MSE {sortField === 'mse' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-sky-700"
                    onClick={() => { setSortField('execution_time_ms'); setSortAsc(sortField === 'execution_time_ms' ? !sortAsc : true); }}
                  >
                    Latency {sortField === 'execution_time_ms' && (sortAsc ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedResults.map((item) => {
                  const isTopPsnr = item.name === bestPsnrItem?.name;
                  const isTopSsim = item.name === bestSsimItem?.name;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Thumbnail */}
                      <td className="py-2.5 px-4">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          onClick={() => setPreviewImage({ url: item.thumbnail, title: item.name })}
                          className="w-10 h-10 object-contain rounded border border-slate-200 bg-slate-900/10 cursor-pointer hover:scale-105 transition"
                          title="Click to enlarge"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isTopPsnr && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Best PSNR
                            </span>
                          )}
                          {isTopSsim && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                              Best SSIM
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.description}</div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.category === 'Spatial' 
                            ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {item.category === 'Spatial' ? <Layers className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                          {item.category}
                        </span>
                      </td>

                      {/* PSNR */}
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        <span className={isTopPsnr ? 'text-emerald-700 font-extrabold' : ''}>
                          {item.metrics.psnr.toFixed(2)} dB
                        </span>
                      </td>

                      {/* SSIM */}
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                        <span className={isTopSsim ? 'text-sky-700 font-extrabold' : ''}>
                          {item.metrics.ssim.toFixed(4)}
                        </span>
                      </td>

                      {/* MSE */}
                      <td className="py-2.5 px-4 font-mono text-slate-700">
                        {item.metrics.mse.toFixed(2)}
                      </td>

                      {/* Latency */}
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {item.metrics.execution_time_ms.toFixed(2)} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Dynamic Scientific Interpretation Card */}
      {benchmarkData?.interpretation && (
        <section className="bg-white rounded-xl border border-sky-200 p-6 shadow-xs bg-gradient-to-br from-white via-sky-50/20 to-slate-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-sky-100 text-sky-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automated Scientific Interpretation</h3>
              <p className="text-[11px] text-slate-500">
                Rigorous mathematical and physical rationale derived from actual measured metrics
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-lg border border-slate-200">
            {benchmarkData.interpretation}
          </div>
        </section>
      )}

      {/* Zoom Modal for Table Thumbnails */}
      {previewImage && (
        <ImageZoomModal
          isOpen={true}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          title={previewImage.title}
          subtitle="Processed Filter Output"
        />
      )}
    </div>
  );
};
