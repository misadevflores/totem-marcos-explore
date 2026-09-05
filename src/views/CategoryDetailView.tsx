import React from 'react';
import { Category, Brochure } from '../types';
import { FileText, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

interface CategoryDetailViewProps {
  category: Category;
  brochures: Brochure[];
  onViewBrochures: () => void;
  onRequestAdvice: () => void;
  onOpenSingleBrochure: (brochure: Brochure) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  brochures,
  onViewBrochures,
  onRequestAdvice,
  onOpenSingleBrochure
}) => {
  const categoryBrochures = brochures.filter(b => b.categoryId === category.id);
  // Filtrar líneas vacías — por si la BD tiene entradas huérfanas tras edición
  const applications = (category.applications ?? []).filter(a => a.trim().length > 0);

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-12">
      <div className="w-full h-full flex flex-col justify-between max-w-[920px] mx-auto space-y-8">
        {/* Category Brand Banner Block */}
        <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-10 lg:p-12 rounded-3xl border border-brand-600 shadow-xl space-y-5 shrink-0">
          <div className="inline-block px-5 py-2 bg-white/10 border border-accent-400/60 rounded-xl text-sm sm:text-base font-black text-accent-300 uppercase tracking-widest">
            {category.code} · {category.title}
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight">
            {category.bannerTitle}
          </h2>
          <p className="text-xl sm:text-2xl text-brand-100 leading-relaxed font-medium">
            {category.bannerDescription}
          </p>
        </div>

        {/* Aplicaciones Principales Section */}
        <div className="space-y-4 shrink-0">
          <h3 className="text-2xl sm:text-3xl font-black text-brand-700 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-accent-500"></span>
            Aplicaciones Principales
          </h3>

          <div className="bg-white p-8 rounded-3xl border-2 border-marco-border space-y-4 shadow-md">
            {applications.length === 0 ? (
              <p className="text-lg text-brand-400 italic">Sin aplicaciones configuradas.</p>
            ) : (
              applications.map((app, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <CheckCircle2 className="w-8 h-8 text-accent-600 shrink-0 mt-0.5" />
                  <span className="text-xl sm:text-2xl text-brand-700 font-bold leading-snug">{app}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Documentos Disponibles Summary List */}
        <div className="space-y-4 my-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-brand-700 flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent-600" />
              Documentos disponibles ({categoryBrochures.length})
            </h3>
            <span className="text-sm sm:text-base font-bold text-brand-500 font-mono bg-brand-100 px-4 py-1.5 rounded-full border border-brand-200">
              Disponibles Offline
            </span>
          </div>

          <div className="space-y-4">
            {categoryBrochures.map((brochure) => (
              <div
                key={brochure.id}
                onClick={() => onOpenSingleBrochure(brochure)}
                className="bg-white hover:bg-slate-50 active:bg-slate-100 p-6 rounded-2xl border-2 border-marco-border hover:border-accent-500/70 flex items-center gap-6 cursor-pointer transition active:scale-[0.99] group shadow-md"
              >
                <div className="w-16 h-16 rounded-xl bg-brand-100 text-brand-700 font-black text-lg flex items-center justify-center shrink-0 border border-brand-200">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-brand-700 text-xl sm:text-2xl group-hover:text-accent-600 transition-colors line-clamp-1">
                    {brochure.title}
                  </h4>
                  <p className="text-base sm:text-lg text-brand-400 mt-1">
                    {brochure.pages} páginas · {brochure.yearOrType}
                  </p>
                </div>
                <ArrowRight className="w-8 h-8 text-brand-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Action Buttons */}
        <div className="flex flex-col items-center gap-5 pt-6 shrink-0">
          <button
            type="button"
            onClick={onViewBrochures}
            className="w-full py-6 px-8 min-h-[100px] bg-brand-800 hover:bg-brand-700 active:bg-brand-950 text-white font-black text-2xl tracking-wider rounded-2xl border-2 border-brand-600 flex items-center justify-center gap-4 transition shadow-xl touch-cta"
          >
            <FileText className="w-8 h-8 text-accent-400" />
            <span>VER BROCHURES</span>
          </button>

          <button
            type="button"
            onClick={onRequestAdvice}
            className="w-full py-6 px-8 min-h-[100px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-2xl tracking-wider rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-4 transition shadow-xl touch-cta"
          >
            <UserCheck className="w-8 h-8 text-white" />
            <span>SOLICITAR ASESORÍA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

