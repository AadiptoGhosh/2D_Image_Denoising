import React from 'react';
import { 
  Activity, 
  Layers, 
  Radio, 
  BarChart3, 
  BookOpen, 
  Sliders, 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendHealthy: boolean | null;
  hasActiveSession: boolean;
  activeFilename?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendHealthy,
  hasActiveSession,
  activeFilename,
}) => {
  const navItems = [
    { id: 'overview', label: 'Home / Overview', icon: Activity },
    { id: 'lab', label: 'Image Lab', icon: FlaskConical },
    { id: 'spatial', label: 'Spatial Domain', icon: Layers },
    { id: 'frequency', label: 'Frequency Domain (FFT)', icon: Radio },
    { id: 'analysis', label: 'Performance Analysis', icon: BarChart3 },
    { id: 'about', label: 'About & Theory', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('overview')}
          >
            <div className="relative w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs overflow-hidden border border-slate-700">
              {/* Matrix of micro-pixels */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-1 opacity-25">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="bg-sky-400 m-0.5 rounded-[1px]" />
                ))}
              </div>
              {/* Sine waveform overlay */}
              <svg className="w-8 h-8 text-sky-400 relative z-10" viewBox="0 0 32 32" fill="none">
                <path 
                  d="M4 18 C8 8, 12 8, 16 16 C20 24, 24 24, 28 14" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-slate-900 tracking-tight">DSP Image Lab</span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded">
                  2-D DSP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Digital Signal Processing & Image Restoration
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status / Indicators */}
          <div className="flex items-center gap-3">
            {hasActiveSession && activeFilename && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium max-w-[120px] truncate">{activeFilename}</span>
              </div>
            )}

            {/* Backend health status pill */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium ${
                isBackendHealthy
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isBackendHealthy === false
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isBackendHealthy ? 'Python DSP Engine connected' : 'DSP Engine offline'}
            >
              {isBackendHealthy ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Engine Active</span>
                </>
              ) : isBackendHealthy === false ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Engine Offline</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="hidden sm:inline">Connecting</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 flex overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
