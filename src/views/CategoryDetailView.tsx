import React from 'react';
import { Category, Brochure } from '../types';
import { FileText, ArrowRight, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-marco-bg text-brand-800 overflow-y-auto">
      {/* Category Brand Banner Block (Wireframe Page 5) */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 rounded-2xl border border-brand-600 shadow-xl space-y-3">
        <div className="inline-block px-3 py-1 bg-white/10 border border-accent-500/60 rounded-md text-xs font-bold text-accent-400 uppercase tracking-widest">
          {category.code} · {category.title}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          {category.bannerTitle}
        </h2>
        <p className="text-sm md:text-base text-brand-100 leading-relaxed font-medium">
          {category.bannerDescription}
        </p>
      </div>

      {/* Aplicaciones Principales Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-brand-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-500"></span>
          Aplicaciones principales
        </h3>

        <div className="bg-white p-5 rounded-xl border border-marco-border space-y-2.5 shadow-sm">
          {category.applications.map((app, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
              <span className="text-sm text-brand-700 font-medium leading-snug">{app}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documentos Disponibles Summary List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-700 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-600" />
            Documentos disponibles ({categoryBrochures.length})
          </h3>
          <span className="text-xs text-brand-400 font-mono">Disponibles Offline</span>
        </div>

        <div className="space-y-2.5">
          {categoryBrochures.slice(0, 2).map((brochure) => (
            <div
              key={brochure.id}
              onClick={() => onOpenSingleBrochure(brochure)}
              className="bg-white hover:bg-marco-bg p-4 rounded-xl border border-marco-border flex items-center gap-4 cursor-pointer transition active:scale-[0.99] group shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 font-black text-sm flex items-center justify-center shrink-0">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-brand-700 text-base group-hover:text-accent-600 transition-colors line-clamp-1">
                  {brochure.title}
                </h4>
                <p className="text-xs text-brand-400 mt-0.5">
                  {brochure.pages} páginas · {brochure.yearOrType}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-brand-300 group-hover:text-accent-500 transition" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Action Buttons (Wireframe Page 5 bottom) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onViewBrochures}
          className="w-full sm:flex-1 py-4 px-6 min-h-[72px] bg-brand-700 hover:bg-brand-600 active:bg-brand-800 text-white font-extrabold text-lg tracking-wider rounded-xl border border-brand-500 flex items-center justify-center gap-3 transition shadow-lg touch-cta"
        >
          <span>VER BROCHURES</span>
        </button>

        <button
          type="button"
          onClick={onRequestAdvice}
          className="w-full sm:flex-1 py-4 px-6 min-h-[72px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-bold text-lg tracking-wider rounded-xl border border-accent-300 flex items-center justify-center gap-3 transition shadow touch-cta"
        >
          <UserCheck className="w-6 h-6 text-white" />
          <span>SOLICITAR ASESORÍA</span>
        </button>
      </div>
    </div>
  );
};
