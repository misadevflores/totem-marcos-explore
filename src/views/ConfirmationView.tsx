import React, { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Check, RefreshCw } from 'lucide-react';
import { Lead } from '../types';
import { getStoredBrochures, getStoredSettings } from '../utils/storage-api';
import { QrCodeCard } from '../components/QrCodeCard';

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

  const brochures = getStoredBrochures();
  const settings = getStoredSettings();

  const qrTargetUrl = useMemo(() => {
    const currentBrochure = lead?.brochureId ? brochures.find((b) => b.id === lead.brochureId) : null;

    if (currentBrochure?.pdfUrl) {
      const rawPdf = currentBrochure.pdfUrl;
      if (rawPdf.startsWith('http://') || rawPdf.startsWith('https://')) {
        return rawPdf;
      }
      // Si estamos en un navegador web (Railway, Vercel, host local)
      if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:') && !window.location.origin.includes('localhost')) {
        return `${window.location.origin}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`;
      }
      // Si hay URL de servidor configurada en ajustes
      if (settings.cloudSyncUrl && settings.cloudSyncUrl.startsWith('http')) {
        const baseUrl = settings.cloudSyncUrl.replace(/\/+$/, '');
        return `${baseUrl}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`;
      }
      // Entorno de pruebas local
      if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:')) {
        return `${window.location.origin}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`;
      }
    }

    // Fallback URL web general
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:')) {
      return `${window.location.origin}/`;
    }
    if (settings.cloudSyncUrl && settings.cloudSyncUrl.startsWith('http')) {
      return settings.cloudSyncUrl;
    }
    return 'https://marco.com.pe';
  }, [lead?.brochureId, brochures, settings.cloudSyncUrl]);

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-10 text-center">
      <div className="w-full h-full flex flex-col justify-between max-w-2xl mx-auto space-y-6">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2 bg-emerald-100 border border-emerald-300 rounded-full text-sm sm:text-base font-black text-emerald-800 mx-auto shrink-0 shadow-sm">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Solicitud Registrada Exitosamente</span>
        </div>

        {/* Main Thank You Message */}
        <div className="space-y-4 my-auto">
          {/* Big Check Circle */}
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xl ring-8 ring-emerald-500/20">
            <Check className="w-14 h-14 stroke-[3.5]" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-brand-700 tracking-tight uppercase">
            ¡Gracias por visitarnos!
          </h2>

          <p className="text-base md:text-xl text-brand-600 font-medium leading-relaxed max-w-lg mx-auto">
            Registramos tu interés en <strong className="text-brand-800 font-black">{lead?.categoryName || 'Soluciones MARCO'}</strong>.
            Un especialista técnico de MARCO se pondrá en contacto a la brevedad.
          </p>

          {/* QR Code Container con Código QR Escaneable Real */}
          <div className="max-w-[320px] mx-auto mt-6">
            <QrCodeCard
              value={qrTargetUrl}
              title={lead?.brochureTitle ? `Brochure: ${lead.brochureTitle}` : 'Catálogo Digital MARCO'}
              subtitle="Escanea con tu celular para abrir y descargar este brochure técnico"
              size={200}
              showLink={true}
            />
            <div className="pt-2 mt-3 bg-white/90 py-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs text-brand-500 font-bold uppercase tracking-wider">Código de Atención</p>
              <p className="text-lg font-black text-brand-800 tracking-widest">{lead?.id ? lead.id.substring(0, 8).toUpperCase() : 'MRCO-001'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Timer */}
        <div className="space-y-4 w-full pt-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={onExploreMore}
              className="w-full sm:flex-1 py-5 px-6 min-h-[76px] lg:min-h-[84px] bg-white hover:bg-slate-50 active:bg-slate-100 text-brand-700 font-black text-lg lg:text-xl tracking-wide rounded-2xl border-2 border-marco-border hover:border-brand-400 transition shadow-md touch-cta"
            >
              EXPLORAR OTRA SOLUCIÓN
            </button>

            <button
              type="button"
              onClick={onFinish}
              className="w-full sm:flex-1 py-5 px-6 min-h-[76px] lg:min-h-[84px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-lg lg:text-xl tracking-wider rounded-2xl border-2 border-accent-300 transition shadow-xl touch-cta"
            >
              FINALIZAR
            </button>
          </div>

          <p className="text-xs sm:text-sm text-brand-400 font-mono flex items-center justify-center gap-2 pt-1">
            <RefreshCw className="w-4 h-4 text-accent-600 animate-spin" />
            <span>Regreso automático al inicio en {timeLeft} segundos.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

