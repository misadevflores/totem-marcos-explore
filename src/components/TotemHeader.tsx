import React from 'react';
import { ChevronLeft, Home, Lock, Database } from 'lucide-react';

interface TotemHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onHome: () => void;
  onOpenAdmin: () => void;
  idleTimeRemaining?: number;
}

export const TotemHeader: React.FC<TotemHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  onHome,
  onOpenAdmin,
  idleTimeRemaining
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg border-b border-slate-800">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Side: Back Button or Branding */}
        <div className="flex items-center gap-3">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 min-h-[56px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 rounded-xl border border-slate-700 font-bold transition shadow"
              aria-label="Regresar"
            >
              <ChevronLeft className="w-7 h-7 text-red-400" />
              <span className="text-lg">Volver</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-xl shadow-md border border-red-500/40">
                M
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-xl text-white block leading-none">
                  MARCO <span className="text-red-500">Explorer</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Expomina 2026 · Tótem Táctil
                </span>
              </div>
            </div>
          )}

          {/* Current Page Title */}
          {showBack && (
            <div className="ml-2 pl-4 border-l border-slate-700 hidden sm:block">
              <h1 className="text-xl font-bold text-white tracking-tight line-clamp-1">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Offline local storage indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700/80 text-xs font-semibold text-emerald-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Offline Safe</span>
          </div>

          {/* Idle Timeout warning if active */}
          {idleTimeRemaining !== undefined && idleTimeRemaining < 20 && (
            <div className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold animate-pulse">
              Reinicio en {idleTimeRemaining}s
            </div>
          )}

          {/* Home Button (⌂ as specified in wireframe) */}
          <button
            type="button"
            onClick={onHome}
            className="flex items-center justify-center min-w-[56px] min-h-[56px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white rounded-xl font-bold transition shadow border border-red-600"
            title="Ir al Inicio"
            aria-label="Inicio"
          >
            <Home className="w-7 h-7" />
          </button>

          {/* Secret / Admin Access Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-3 min-w-[48px] min-h-[48px] text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition"
            title="Panel de Administración"
            aria-label="Panel de Administración"
          >
            <Lock className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
