import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Mail, UserCheck, X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Brochure, Category } from '../types';
import { getStoredSettings } from '../utils/storage-api';
import { QrCodeCard } from './QrCodeCard';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const docCache = new Map<string, any>();

async function getCachedPdfDocument(url: string) {
  const safeUrl = encodeURI(decodeURI(url));
  if (docCache.has(safeUrl)) return docCache.get(safeUrl);
  
  const loadingTask = getDocument({
    url: safeUrl,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/standard_fonts/',
  });
  const doc = await loadingTask.promise;
  docCache.set(url, doc);
  return doc;
}

// Caché de imágenes renderizadas para acceso instantáneo
const renderCache = new Map<string, string>();

interface PdfPageCanvasProps {
  pdfUrl: string;
  pageNumber: number;
  zoom: number;
  title: string;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({ pdfUrl, pageNumber, zoom, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [renderedPage, setRenderedPage] = useState<number | null>(null);
  const [cachedImage, setCachedImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | undefined;

    const cacheKey = `${pdfUrl}_${pageNumber}_${zoom}`;
    if (renderCache.has(cacheKey)) {
      setCachedImage(renderCache.get(cacheKey)!);
      setStatus('ready');
      setRenderedPage(pageNumber);
      return;
    }

    setStatus('loading');
    setCachedImage(null);

    getCachedPdfDocument(pdfUrl)
      .then(async (pdf) => {
        if (cancelled) return;
        
        // Pre-fetch next page in background to speed up subsequent navigation
        if (pageNumber < pdf.numPages) {
          pdf.getPage(pageNumber + 1).catch(() => {});
        }

        const page = await pdf.getPage(pageNumber);
        if (cancelled || !canvasRef.current || !containerRef.current) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, containerRef.current.clientWidth - 32);
        const scale = Math.max(0.5, (availableWidth / baseViewport.width) * zoom);
        
        // Optimizar calidad vs rendimiento con devicePixelRatio (capeado a 1.5 para mejor rendimiento)
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
        if (!context) throw new Error('No se pudo preparar el canvas del PDF.');

        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        
        // Normalizar la escala del contexto para soporte de pantallas Retina
        context.scale(pixelRatio, pixelRatio);

        renderTask = page.render({ canvas, canvasContext: context, viewport });
        await renderTask.promise;
        
        if (!cancelled) {
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            renderCache.set(cacheKey, dataUrl);
            setCachedImage(dataUrl);
          } catch (e) {
            // Ignorar errores de toDataURL (p. ej. por seguridad CORS en algunos entornos)
          }
          setStatus('ready');
          setRenderedPage(pageNumber);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && (error as { name?: string }).name !== 'RenderingCancelledException') {
          console.warn('[PDF Render]', error);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pageNumber, pdfUrl, zoom]);

  // Si estamos cargando pero ya tenemos una página renderizada, mantenemos su visibilidad (opacidad reducida)
  // para evitar el "parpadeo blanco" al cambiar de página.
  const isTransitioning = status === 'loading' && renderedPage !== null;

  return (
    <div ref={containerRef} className="relative flex min-h-full min-w-full items-start justify-center p-4">
      {status !== 'ready' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-slate-900/80 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-sm animate-pulse">
            {status === 'loading' ? 'Cargando página...' : 'Error al cargar página.'}
          </div>
        </div>
      )}
      {cachedImage && status === 'ready' ? (
        <img 
          src={cachedImage} 
          alt={`Página ${pageNumber} de ${title}`}
          className="bg-white shadow-2xl animate-in fade-in duration-150"
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-label={`Página ${pageNumber} de ${title}`}
          className={`bg-white shadow-2xl transition-opacity duration-150 ${
            status === 'ready' ? 'opacity-100' : isTransitioning ? 'opacity-40 blur-[2px]' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

interface PdfViewerModalProps {
  brochure: Brochure;
  category?: Category;
  onClose: () => void;
  onSendToEmail: (brochure: Brochure) => void;
  onRequestSpecialist: (brochure: Brochure) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  brochure,
  category,
  onClose,
  onSendToEmail,
  onRequestSpecialist
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const totalPages = brochure.pages || 16;
  const pageImages = brochure.pageImages || [];
  const hasPdf = Boolean(brochure.pdfUrl);

  const currentImageUrl = pageImages.length > 0
    ? pageImages[(currentPage - 1) % pageImages.length]
    : undefined;

  const [showQrModal, setShowQrModal] = useState(false);
  const settings = getStoredSettings();

  const qrTargetUrl = useMemo(() => {
    if (brochure.pdfUrl) {
      const rawPdf = brochure.pdfUrl;
      if (rawPdf.startsWith('http://') || rawPdf.startsWith('https://')) {
        return rawPdf;
      }
      if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:') && !window.location.origin.includes('localhost')) {
        return `${window.location.origin}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`;
      }
      if (settings.cloudSyncUrl && settings.cloudSyncUrl.startsWith('http')) {
        const baseUrl = settings.cloudSyncUrl.replace(/\/+$/, '');
        return `${baseUrl}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`;
      }
      if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:')) {
        return `${window.location.origin}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`;
      }
    }
    return typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://marco.com.pe';
  }, [brochure.pdfUrl, settings.cloudSyncUrl]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Modal para Escanear Código QR con el Celular */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Abrir en tu Celular</h3>
            <p className="text-xs text-slate-300 mb-4 font-medium">{brochure.title}</p>

            <QrCodeCard
              value={qrTargetUrl}
              subtitle="Apunta la cámara de tu smartphone para abrir o descargar este documento PDF"
              size={200}
              showLink={true}
              className="mx-auto"
            />

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-5 w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl border border-slate-700 font-bold transition flex items-center gap-2"
          >
            <ChevronLeft className="w-6 h-6 text-red-400" />
            <span>Volver</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white line-clamp-1">{brochure.title}</h2>
            <p className="text-xs text-slate-400">{category?.title || 'Documento Técnico'} · {brochure.yearOrType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2.5 bg-brand-700 hover:bg-brand-600 active:bg-brand-800 text-white rounded-xl border border-brand-500 font-bold text-xs flex items-center gap-1.5 transition shadow"
            title="Escanear QR para abrir en tu celular"
          >
            <QrIcon className="w-4 h-4" />
            <span>Ver QR en Móvil</span>
          </button>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Document Viewer Canvas */}
      <div className="flex-1 min-h-0 bg-slate-950 p-3 md:p-6 flex flex-col items-center justify-center overflow-auto">
        <div className="w-full max-w-5xl h-full min-h-[320px] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto bg-slate-700 p-2 md:p-5 flex justify-center">
            {hasPdf ? (
              <PdfPageCanvas
                key={brochure.pdfUrl}
                pdfUrl={brochure.pdfUrl!}
                pageNumber={currentPage}
                zoom={zoom}
                title={brochure.title}
              />
            ) : currentImageUrl ? (
              <div className="flex items-start justify-center min-w-full min-h-full">
                <img
                  src={currentImageUrl}
                  alt={`Página ${currentPage} de ${brochure.title}`}
                  className="max-w-none w-auto h-auto min-h-full object-contain bg-white shadow-xl transition-transform duration-200 origin-top"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>
            ) : (
              <div className="m-auto max-w-lg rounded-xl bg-white p-8 text-center text-slate-700">
                <p className="text-lg font-bold">Este documento no tiene un archivo PDF disponible.</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
            <>
              <button onClick={() => setZoom(Math.max(0.75, zoom - 0.25))} className="p-2 rounded-lg hover:bg-slate-700" aria-label="Alejar">
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="min-w-16 text-center font-semibold">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(2.5, zoom + 0.25))} className="p-2 rounded-lg hover:bg-slate-700" aria-label="Acercar">
                <ZoomIn className="h-5 w-5" />
              </button>
              <button onClick={() => setZoom(1)} className="p-2 rounded-lg hover:bg-slate-700" aria-label="Restablecer zoom">
                <RotateCcw className="h-5 w-5" />
              </button>
            </>
            <span className="font-semibold">Página {currentPage} de {totalPages}</span>
            {hasPdf && (
              <>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-emerald-300 hover:bg-slate-700"
                >
                  <QrIcon className="w-4 h-4" />
                  <span>Código QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Trigger download of bundled PDF (works for local module URLs)
                    try {
                      const link = document.createElement('a');
                      link.href = brochure.pdfUrl as string;
                      link.download = `${brochure.title}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (e) {
                      // Fallback: do nothing, PDF is still viewable inline via pdfjs
                      console.error('No se pudo descargar el PDF localmente', e);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-cyan-300 hover:bg-slate-700"
                >
                  Descargar PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Toolbar */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-3 py-2.5 md:px-4 md:py-3 space-y-2">
        {/* Navigation Page Controls */}
        <div className="flex items-center justify-center gap-2 md:gap-3 max-w-xl mx-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex-1 min-w-0 py-2.5 px-2 md:px-4 min-h-[48px] bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base transition shadow"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
            <span>ANTERIOR</span>
          </button>

          <span className="shrink-0 text-xs md:text-sm font-bold text-slate-300 px-2.5 md:px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 font-mono">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex-1 min-w-0 py-2.5 px-2 md:px-4 min-h-[48px] bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base transition shadow"
          >
            <span>SIGUIENTE</span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="grid grid-cols-2 items-stretch gap-3 md:gap-4 max-w-xl mx-auto pt-1">
          <button
            onClick={() => onSendToEmail(brochure)}
            className="w-full min-w-0 py-4 px-4 min-h-[84px] bg-brand-800 hover:bg-brand-700 active:bg-brand-950 text-white font-black rounded-2xl border-2 border-brand-600 flex items-center justify-center gap-2.5 text-sm md:text-base transition shadow-xl touch-cta"
          >
            <Mail className="w-5 h-5 shrink-0 text-accent-400" />
            <span className="leading-tight">ENVIAR A MI CORREO</span>
          </button>

          <button
            onClick={() => onRequestSpecialist(brochure)}
            className="w-full min-w-0 py-4 px-4 min-h-[84px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-2.5 text-sm md:text-base transition shadow-xl touch-cta"
          >
            <UserCheck className="w-5 h-5 shrink-0 text-white" />
            <span className="leading-tight">QUIERO ASESORÍA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
