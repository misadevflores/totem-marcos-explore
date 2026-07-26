import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, UserCheck, X, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Brochure, Category } from '../types';

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
  const totalPages = brochure.pages || 16;
  const pageImages = brochure.pageImages && brochure.pageImages.length > 0
    ? brochure.pageImages
    : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'];

  const currentImageUrl = pageImages[(currentPage - 1) % pageImages.length];

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
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
      <div className="flex-1 bg-slate-950 p-4 md:p-6 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 flex flex-col relative min-h-[460px]">
          {/* Document Simulated Canvas */}
          <div className="relative aspect-[3/4] bg-slate-100 flex flex-col justify-between p-6 overflow-hidden">
            <img
              src={currentImageUrl}
              alt={`Página ${currentPage}`}
              className="absolute inset-0 w-full h-full object-cover opacity-25 filter contrast-125"
            />
            <div className="relative z-10 flex items-center justify-between border-b border-slate-300 pb-3">
              <span className="font-extrabold text-red-800 tracking-wider text-sm">MARCO EXPLORER</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                DOCUMENTO OFFLINE
              </span>
            </div>

            {/* Simulated Page Content View as wireframe page 7 */}
            <div className="relative z-10 my-auto text-center space-y-4 px-4 py-8 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
              <div className="w-16 h-16 bg-red-100 text-red-800 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-inner">
                PDF
              </div>
              <h3 className="text-2xl font-black text-red-900 uppercase tracking-tight leading-tight">
                {currentPage === 1 ? brochure.title : `CAPÍTULO ${currentPage}: ESPECIFICACIONES`}
              </h3>
              <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
                {brochure.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-600">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Página {currentPage} de {totalPages}
              </div>
            </div>

            {/* Bottom Page Watermark */}
            <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-500 pt-3 border-t border-slate-300">
              <span>Expomina 2026</span>
              <span>Página {currentPage} / {totalPages}</span>
            </div>
          </div>

          {/* Page Counter Indicator */}
          <div className="bg-slate-100 text-center py-2 text-xs font-bold text-slate-600 border-t border-slate-200">
            Página {currentPage} de {totalPages} · Pinza para ampliar · Deslizar para cambiar página
          </div>
        </div>
      </div>

      {/* Bottom Action Toolbar (80px+ touch targets as specified in wireframe 06) */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 md:p-6 space-y-3">
        {/* Navigation Page Controls */}
        <div className="flex items-center justify-center gap-4 max-w-lg mx-auto">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="flex-1 py-3.5 px-4 min-h-[60px] bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-base transition shadow"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>ANTERIOR</span>
          </button>

          <span className="text-sm font-bold text-slate-300 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 font-mono">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="flex-1 py-3.5 px-4 min-h-[60px] bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-base transition shadow"
          >
            <span>SIGUIENTE</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto pt-1">
          <button
            onClick={() => onSendToEmail(brochure)}
            className="w-full sm:flex-1 py-4 px-6 min-h-[68px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-extrabold rounded-xl border border-red-600 flex items-center justify-center gap-3 text-lg transition shadow-lg"
          >
            <Mail className="w-6 h-6 text-red-200" />
            <span>ENVIAR A MI CORREO</span>
          </button>

          <button
            onClick={() => onRequestSpecialist(brochure)}
            className="w-full sm:flex-1 py-4 px-6 min-h-[68px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-3 text-lg transition shadow-lg"
          >
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <span>QUIERO ASESORÍA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
