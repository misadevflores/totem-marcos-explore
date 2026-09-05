import React from 'react';
import { ChevronLeft, Home, Lock, Sparkles } from 'lucide-react';
import marcoLogo from '../../assets/imgi_1_logo-marco-blanco.svg';

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
    <header className="sticky top-0 z-30 bg-brand-900 text-white shadow-xl border-b border-brand-700/80 shrink-0 select-none">
      <div className="px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand & Left Actions */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={marcoLogo}
              alt="MARCO"
              className="w-auto h-12 sm:h-16 lg:h-18 object-contain"
            />
            <div className="h-8 sm:h-10 border-l-2 border-brand-500/50 hidden sm:block"></div>
            <span className="font-black text-xs sm:text-sm tracking-widest text-accent-400 uppercase hidden sm:block">
              Explorer
            </span>
          </div>

          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2.5 px-6 py-3 min-h-[64px] bg-brand-800 hover:bg-brand-700 active:bg-brand-950 text-white rounded-2xl border-2 border-brand-600 font-extrabold transition shadow-md active:scale-95 touch-manipulation"
              aria-label="Regresar"
            >
              <ChevronLeft className="w-8 h-8 text-accent-400 shrink-0" />
              <span className="text-xl">Volver</span>
            </button>
          ) : null}

          {/* Current Page Title */}
          {showBack && (
            <div className="ml-2 pl-4 border-l-2 border-brand-700/80 hidden md:block min-w-0">
              <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight line-clamp-1">{title}</h1>
              {subtitle && <p className="text-xs lg:text-sm text-brand-200 line-clamp-1 mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Idle Timeout warning if active */}
          {idleTimeRemaining !== undefined && idleTimeRemaining < 20 && (
            <div className="px-4 py-2 bg-accent-500/20 text-accent-300 border border-accent-400/40 rounded-full text-xs sm:text-sm font-black animate-pulse">
              Reinicio en {idleTimeRemaining}s
            </div>
          )}

          {/* Home Button (⌂ as specified in wireframe) */}
          <button
            type="button"
            onClick={onHome}
            className="flex items-center justify-center min-w-[64px] min-h-[64px] px-4 bg-brand-800 hover:bg-brand-700 active:bg-brand-950 text-white rounded-2xl font-bold transition shadow-md border-2 border-brand-600 active:scale-95 touch-manipulation"
            title="Ir al Inicio"
            aria-label="Inicio"
          >
            <Home className="w-8 h-8 text-accent-400" />
          </button>

          {/* Secret / Admin Access Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-3 min-w-[56px] min-h-[56px] text-brand-400 hover:text-white active:text-accent-400 rounded-2xl transition flex items-center justify-center"
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
