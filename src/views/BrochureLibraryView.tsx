import React from 'react';
import { Category, Brochure } from '../types';
import { FileText, ChevronRight, Mail, Sparkles } from 'lucide-react';

interface BrochureLibraryViewProps {
  category: Category;
  brochures: Brochure[];
  onOpenBrochure: (brochure: Brochure) => void;
  onSendAllToEmail: () => void;
}

export const BrochureLibraryView: React.FC<BrochureLibraryViewProps> = ({
  category,
  brochures,
  onOpenBrochure,
  onSendAllToEmail
}) => {
  const categoryBrochures = brochures.filter(b => b.categoryId === category.id);

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-12">
      <div className="w-full h-full flex flex-col justify-between max-w-[920px] mx-auto space-y-8">
        {/* Page Title Header */}
        <div className="space-y-4 text-left shrink-0">
          <div className="inline-block px-5 py-2 bg-brand-100 border border-brand-200 rounded-xl text-sm sm:text-base font-black text-brand-700">
            Brochures · {category.title}
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-brand-700 tracking-tight pt-1">
            Selecciona un documento
          </h2>
          <p className="text-xl md:text-3xl text-brand-500 font-medium">
            Toca cualquier documento para abrir el visor táctil interactivo en alta resolución.
          </p>
        </div>

        {/* List of Brochure Items */}
        <div className="space-y-6 my-auto">
          {categoryBrochures.map((brochure) => (
            <button
              key={brochure.id}
              type="button"
              onClick={() => onOpenBrochure(brochure)}
              className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 p-8 rounded-3xl border-2 border-marco-border hover:border-accent-500/70 transition flex items-center gap-6 text-left shadow-md hover:shadow-xl active:scale-[0.99] group touch-manipulation"
            >
              {/* PDF Box Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-100 text-brand-700 font-black text-2xl flex items-center justify-center shrink-0 shadow-inner border border-brand-200">
                PDF
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-brand-700 text-2xl sm:text-3xl group-hover:text-accent-600 transition-colors line-clamp-1">
                  {brochure.title}
                </h3>
                <p className="text-lg sm:text-xl text-brand-500 mt-2">
                  {brochure.pages} páginas · {brochure.yearOrType}
                </p>
                <p className="text-sm sm:text-base text-brand-400 mt-1 line-clamp-1 font-mono">
                  {brochure.fileSize} · Guardado Offline
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-10 h-10 text-brand-300 group-hover:text-accent-500 group-hover:translate-x-1.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        {/* Send All To Email Action Button */}
        <div className="pt-6 shrink-0">
          <button
            type="button"
            onClick={onSendAllToEmail}
            className="w-full py-6 px-8 min-h-[100px] bg-brand-800 hover:bg-brand-700 active:bg-brand-950 text-white font-black text-2xl lg:text-3xl tracking-wider rounded-2xl border-2 border-brand-600 flex items-center justify-center gap-4 transition shadow-xl touch-cta"
          >
            <Mail className="w-8 h-8 text-accent-400" />
            <span>ENVIAR TODOS A MI CORREO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
