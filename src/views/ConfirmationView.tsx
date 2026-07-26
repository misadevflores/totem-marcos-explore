import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, QrCode, RefreshCw, Home, Download } from 'lucide-react';
import { Lead } from '../types';

interface ConfirmationViewProps {
  lead: Lead | null;
  onExploreMore: () => void;
  onFinish: () => void;
  autoResetSeconds?: number;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  lead,
  onExploreMore,
  onFinish,
  autoResetSeconds = 20
}) => {
  const [timeLeft, setTimeLeft] = useState(autoResetSeconds);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if confetti fails in test environment
    }

    // Auto reset timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onFinish]);

  const qrTargetUrl = lead?.brochureId
    ? `https://marco.com.pe/brochures/download/${lead.brochureId}`
    : 'https://marco.com.pe/expomina2026';

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-slate-900 text-white overflow-y-auto text-center">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-950/80 border border-emerald-600/80 rounded-full text-xs font-bold text-emerald-300 mx-auto">
        <Check className="w-4 h-4 text-emerald-400" />
        <span>Solicitud Registrada Exitosamente</span>
      </div>

      {/* Main Thank You Message */}
      <div className="space-y-3 my-auto max-w-md mx-auto">
        {/* Big Check Circle (Wireframe Page 11) */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-500/20">
          <Check className="w-14 h-14 stroke-[3]" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
          ¡Gracias por visitarnos!
        </h2>

        <p className="text-base text-slate-300 font-medium leading-relaxed">
          Registramos tu interés en <strong className="text-white">{lead?.categoryName || 'Soluciones MARCO'}</strong>.
          Un especialista de MARCO se pondrá en contacto a la brevedad.
        </p>

        {/* QR Code Container (Wireframe Page 11) */}
        <div className="bg-white p-5 rounded-2xl shadow-2xl border-4 border-slate-800 max-w-[240px] mx-auto space-y-2 mt-4">
          {/* Simulated High Definition SVG QR Code */}
          <div className="aspect-square bg-slate-900 p-3 rounded-xl flex items-center justify-center text-white relative group">
            <QrCode className="w-full h-full text-white" />
            <div className="absolute inset-0 bg-red-900/10 rounded-xl pointer-events-none"></div>
          </div>
          <p className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
            Escanea para abrir o descargar el brochure en tu móvil
          </p>
        </div>
      </div>

      {/* Action Buttons & Timer */}
      <div className="space-y-3 max-w-md mx-auto w-full pt-2">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onExploreMore}
            className="w-full sm:flex-1 py-4 px-5 min-h-[64px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 font-bold text-base tracking-wide rounded-xl border border-slate-600 transition shadow"
          >
            EXPLORAR OTRA SOLUCIÓN
          </button>

          <button
            type="button"
            onClick={onFinish}
            className="w-full sm:flex-1 py-4 px-5 min-h-[64px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-extrabold text-base tracking-wider rounded-xl border border-red-600 transition shadow-lg"
          >
            FINALIZAR
          </button>
        </div>

        <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-1">
          <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
          <span>Regreso automático al inicio en {timeLeft} segundos.</span>
        </p>
      </div>
    </div>
  );
};
