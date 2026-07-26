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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-slate-900 text-white overflow-y-auto">
      {/* Category Brand Banner Block (Wireframe Page 5) */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="inline-block px-3 py-1 bg-red-900/60 border border-red-700/60 rounded-md text-xs font-bold text-red-200 uppercase tracking-widest">
          {category.code} · {category.title}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          {category.bannerTitle}
        </h2>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
          {category.bannerDescription}
        </p>
      </div>

      {/* Aplicaciones Principales Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          Aplicaciones principales
        </h3>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 space-y-2.5">
          {category.applications.map((app, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-200 font-medium leading-snug">{app}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documentos Disponibles Summary List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            Documentos disponibles ({categoryBrochures.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Disponibles Offline</span>
        </div>

        <div className="space-y-2.5">
          {categoryBrochures.slice(0, 2).map((brochure) => (
            <div
              key={brochure.id}
              onClick={() => onOpenSingleBrochure(brochure)}
              className="bg-slate-800/90 hover:bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer transition active:scale-[0.99] group"
            >
              <div className="w-12 h-12 rounded-lg bg-red-100 text-red-800 font-black text-sm flex items-center justify-center shrink-0">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base group-hover:text-red-400 transition-colors line-clamp-1">
                  {brochure.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {brochure.pages} páginas · {brochure.yearOrType}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Action Buttons (Wireframe Page 5 bottom) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onViewBrochures}
          className="w-full sm:flex-1 py-4 px-6 min-h-[72px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-extrabold text-lg tracking-wider rounded-xl border border-red-600 flex items-center justify-center gap-3 transition shadow-lg"
        >
          <span>VER BROCHURES</span>
        </button>

        <button
          type="button"
          onClick={onRequestAdvice}
          className="w-full sm:flex-1 py-4 px-6 min-h-[72px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 font-bold text-lg tracking-wider rounded-xl border border-slate-600 flex items-center justify-center gap-3 transition shadow"
        >
          <UserCheck className="w-6 h-6 text-emerald-400" />
          <span>SOLICITAR ASESORÍA</span>
        </button>
      </div>
    </div>
  );
};
