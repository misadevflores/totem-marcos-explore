import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, UserCheck, X, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { Brochure, Category } from '../types';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

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

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | undefined;
    const loadingTask = getDocument(pdfUrl);

    setStatus('loading');
    loadingTask.promise
      .then(async (pdf) => {
        const page = await pdf.getPage(pageNumber);
        if (cancelled || !canvasRef.current || !containerRef.current) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, containerRef.current.clientWidth - 32);
        const scale = Math.max(0.5, (availableWidth / baseViewport.width) * zoom);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No se pudo preparar el canvas del PDF.');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        renderTask = page.render({ canvas, canvasContext: context, viewport });
        await renderTask.promise;
        if (!cancelled) setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!cancelled && (error as { name?: string }).name !== 'RenderingCancelledException') {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      renderTask?.cancel();
      void loadingTask.destroy();
    };
  }, [pageNumber, pdfUrl, zoom]);

  return (
    <div ref={containerRef} className="relative flex min-h-full min-w-full items-start justify-center p-4">
      {status !== 'ready' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm font-semibold text-slate-600">
          {status === 'loading' ? 'Cargando página...' : 'No se pudo cargar esta página del PDF.'}
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-label={`Página ${pageNumber} de ${title}`}
        className={`bg-white shadow-xl ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
      />
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

        <button
          onClick={onClose}
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* Main Document Viewer Canvas */}
      <div className="flex-1 min-h-0 bg-slate-950 p-3 md:p-6 flex flex-col items-center justify-center overflow-auto">
        <div className="w-full max-w-5xl h-full min-h-[320px] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto bg-slate-700 p-2 md:p-5 flex justify-center">
            {hasPdf ? (
              <PdfPageCanvas
                key={`${brochure.pdfUrl}-${currentPage}-${zoom}`}
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
            {!hasPdf && (
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
            )}
            <span className="font-semibold">Página {currentPage} de {totalPages}</span>
            {hasPdf && (
              <a href={brochure.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-cyan-300 hover:bg-slate-700">
                Abrir PDF <ExternalLink className="h-4 w-4" />
              </a>
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
        <div className="grid grid-cols-2 items-stretch gap-2 md:gap-3 max-w-xl mx-auto">
          <button
            onClick={() => onSendToEmail(brochure)}
            className="w-full min-w-0 py-2 px-2 md:px-3 min-h-[44px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-extrabold rounded-lg border border-red-600 flex items-center justify-center gap-1.5 text-xs md:text-sm transition shadow-lg"
          >
            <Mail className="w-4 h-4 shrink-0 text-red-200" />
            <span className="leading-tight">ENVIAR A MI CORREO</span>
          </button>

          <button
            onClick={() => onRequestSpecialist(brochure)}
            className="w-full min-w-0 py-2 px-2 md:px-3 min-h-[44px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold rounded-lg border border-slate-600 flex items-center justify-center gap-1.5 text-xs md:text-sm transition shadow-lg"
          >
            <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-tight">QUIERO ASESORÍA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
