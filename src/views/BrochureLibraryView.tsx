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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-slate-900 text-white overflow-y-auto">
      {/* Page Title Header */}
      <div className="space-y-1 text-left">
        <div className="inline-block px-3 py-1 bg-red-950 border border-red-800 rounded-md text-xs font-bold text-red-300">
          Brochures · {category.title}
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight pt-1">
          Selecciona un documento
        </h2>
        <p className="text-xs text-slate-400">
          Toca cualquier documento para abrir el visor táctil interactivo
        </p>
      </div>

      {/* List of Brochure Items (Wireframe Page 6) */}
      <div className="space-y-3 my-auto">
        {categoryBrochures.map((brochure) => (
          <button
            key={brochure.id}
            type="button"
            onClick={() => onOpenBrochure(brochure)}
            className="w-full bg-slate-800/90 hover:bg-slate-800 active:bg-slate-700 p-5 rounded-2xl border border-slate-700/80 hover:border-red-600 transition flex items-center gap-4 text-left shadow-lg active:scale-[0.99] group"
          >
            {/* PDF Box Badge */}
            <div className="w-16 h-16 rounded-xl bg-red-100 text-red-900 font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
              PDF
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg group-hover:text-red-400 transition-colors line-clamp-1">
                {brochure.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {brochure.pages} páginas · {brochure.yearOrType}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-mono">
                {brochure.fileSize} · Guardado Offline
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-7 h-7 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        ))}
      </div>

      {/* Send All To Email Action Button (Wireframe Page 6 bottom) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSendAllToEmail}
          className="w-full py-5 px-6 min-h-[76px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 font-extrabold text-lg tracking-wider rounded-xl border border-slate-600 flex items-center justify-center gap-3 transition shadow-lg"
        >
          <Mail className="w-6 h-6 text-red-400" />
          <span>ENVIAR TODOS A MI CORREO</span>
        </button>
      </div>
    </div>
  );
};
