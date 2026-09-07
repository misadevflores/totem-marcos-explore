import React from 'react';
import { Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { Search, UserCheck, ChevronRight } from 'lucide-react';

interface HomeCategoriesViewProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onNotFoundRoute: () => void;
  onSpecialistRoute: () => void;
}

export const HomeCategoriesView: React.FC<HomeCategoriesViewProps> = ({
  categories,
  onSelectCategory,
  onNotFoundRoute,
  onSpecialistRoute
}) => {
  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-12">
      <div className="w-full min-h-[100dvh] pb-32 flex flex-col justify-between max-w-[920px] mx-auto space-y-8">
        {/* Page Title Header */}
        <div className="space-y-6 text-left shrink-0">
          <h2 className="text-5xl md:text-7xl font-black text-brand-700 tracking-tight">
            ¿Qué solución necesitas?
          </h2>
          <p className="text-2xl md:text-4xl text-brand-500 font-medium leading-relaxed">
            Selecciona una categoría para conocer productos, aplicaciones y brochures técnicos.
          </p>
        </div>

        {/* 6 Category Cards Grid (Portrait 2 Columns for 1080x1920) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 my-auto flex-1 content-center">
          {[...categories].sort((a, b) => {
            const na = parseInt(a.code, 10) || 0;
            const nb = parseInt(b.code, 10) || 0;
            return na !== nb ? na - nb : a.code.localeCompare(b.code);
          }).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="group relative bg-white hover:bg-slate-50 active:bg-slate-100 p-8 rounded-3xl border-2 border-marco-border hover:border-accent-500/70 transition-all text-left shadow-md hover:shadow-xl flex items-center gap-8 min-h-[220px] lg:min-h-[260px] active:scale-[0.98] touch-manipulation"
            >
              {/* Category Icon Box (Seamless deep blue container uniting with icon art) */}
              <div
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-md bg-[#003067] border border-[#003067] group-hover:border-accent-500/60 transition-all duration-300"
              >
                <CategoryIcon
                  category={cat}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  vectorClassName="w-12 h-12 lg:w-16 lg:h-16 text-white"
                />
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-3xl lg:text-4xl font-black text-brand-700 group-hover:text-accent-600 transition-colors line-clamp-1">
                    {cat.title}
                  </h3>
                  <ChevronRight className="w-12 h-12 text-brand-300 group-hover:text-accent-500 group-hover:translate-x-1.5 transition-all shrink-0" />
                </div>
                <p className="text-xl lg:text-2xl text-brand-500 mt-3 line-clamp-2 leading-relaxed">
                  {cat.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Secondary Action Buttons (Ergonomic Touch Targets > 100px) */}
        <div className="space-y-8 pt-8 shrink-0">
          {/* Route A Button */}
          <button
            type="button"
            onClick={onNotFoundRoute}
            className="w-full py-8 px-8 min-h-[120px] bg-white hover:bg-slate-50 active:bg-slate-100 text-brand-700 font-extrabold text-3xl tracking-wide rounded-2xl border-2 border-marco-border hover:border-brand-400 flex items-center justify-center gap-6 transition shadow-md touch-cta"
          >
            <Search className="w-10 h-10 text-brand-500 shrink-0" />
            <span>NO ENCONTRÉ LO QUE BUSCABA</span>
          </button>

          {/* Route B Button */}
          <button
            type="button"
            onClick={onSpecialistRoute}
            className="w-full py-8 px-8 min-h-[120px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-3xl lg:text-4xl tracking-wider rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-6 transition shadow-xl touch-cta"
          >
            <UserCheck className="w-12 h-12 text-white shrink-0" />
            <span>QUIERO HABLAR CON UN ESPECIALISTA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

