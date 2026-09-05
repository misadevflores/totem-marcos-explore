import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Loader2, ExternalLink } from 'lucide-react';

interface QrCodeCardProps {
  value: string;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
  showLink?: boolean;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  value,
  title,
  subtitle,
  size = 200,
  className = '',
  showLink = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    setLoading(true);
    setError(null);

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      },
      (err) => {
        setLoading(false);
        if (err) {
          console.error('[QR] Error generando código QR:', err);
          setError('No se pudo generar el código QR');
        }
      }
    );
  }, [value, size]);

  return (
    <div className={`bg-white p-4 rounded-2xl shadow-xl border-2 border-brand-200 flex flex-col items-center text-center ${className}`}>
      {/* Contenedor del Canvas QR con fondo blanco puro para lectura óptima */}
      <div className="relative bg-white p-2 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <span className="text-[10px] text-slate-500 font-bold mt-1">Generando QR...</span>
          </div>
        )}

        {error ? (
          <div className="w-[180px] h-[180px] flex flex-col items-center justify-center text-red-500 p-2">
            <QrIcon className="w-8 h-8 mb-1" />
            <p className="text-xs">{error}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="block max-w-full h-auto rounded-lg"
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        )}
      </div>

      {title && (
        <p className="text-xs font-bold text-brand-800 tracking-tight mt-2.5 leading-snug">
          {title}
        </p>
      )}

      {subtitle && (
        <p className="text-[11px] text-brand-600 font-medium mt-0.5 leading-tight max-w-[220px]">
          {subtitle}
        </p>
      )}

      {showLink && value && (value.startsWith('http://') || value.startsWith('https://')) && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent-600 hover:text-accent-700 font-bold underline"
        >
          <span>Abrir enlace</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};
