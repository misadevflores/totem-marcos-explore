import React from 'react';
import { ChevronLeft, Home, Lock, Database } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-brand-900 text-white shadow-lg border-b border-brand-700">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Brand remains visible on every route without a button-like wrapper. */}
        <div className="flex items-center gap-3">
          <img
            src={marcoLogo}
            alt="MARCO"
            className="w-[150px] h-auto max-h-10 object-contain shrink-0"
          />

          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 min-h-[56px] bg-brand-700 hover:bg-brand-600 active:bg-brand-800 text-white rounded-xl border border-brand-600 font-bold transition shadow"
              aria-label="Regresar"
            >
              <ChevronLeft className="w-7 h-7 text-accent-400" />
              <span className="text-lg">Volver</span>
            </button>
          ) : null}

          {/* Current Page Title */}
          {showBack && (
            <div className="ml-2 pl-4 border-l border-brand-600 hidden sm:block">
              <h1 className="text-xl font-bold text-white tracking-tight line-clamp-1">{title}</h1>
              {subtitle && <p className="text-xs text-brand-200 line-clamp-1">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* totem-marco database indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-marco-bg rounded-full border border-marco-border text-xs font-semibold text-brand-600">
            <Database className="w-3.5 h-3.5 text-accent-600" />
            <span>totem-marco</span>
          </div>

          {/* Idle Timeout warning if active */}
          {idleTimeRemaining !== undefined && idleTimeRemaining < 20 && (
            <div className="px-3 py-1.5 bg-accent-500/20 text-brand-700 border border-accent-600/30 rounded-full text-xs font-bold animate-pulse">
              Reinicio en {idleTimeRemaining}s
            </div>
          )}

          {/* Home Button (⌂ as specified in wireframe) */}
          <button
            type="button"
            onClick={onHome}
            className="flex items-center justify-center min-w-[56px] min-h-[56px] bg-brand-700 hover:bg-brand-600 active:bg-brand-800 text-white rounded-xl font-bold transition shadow border border-brand-600"
            title="Ir al Inicio"
            aria-label="Inicio"
          >
            <Home className="w-7 h-7 text-accent-400" />
          </button>

          {/* Secret / Admin Access Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-3 min-w-[48px] min-h-[48px] text-brand-300 hover:text-brand-600 hover:bg-marco-bg rounded-xl transition"
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
