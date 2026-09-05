import React from 'react';
import { Category } from '../types';
import { Droplets, Wrench, Boxes, Filter, FlaskConical, BookOpen, Search, UserCheck, ChevronRight } from 'lucide-react';

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
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets className="w-8 h-8" />;
      case 'Wrench': return <Wrench className="w-8 h-8" />;
      case 'Boxes': return <Boxes className="w-8 h-8" />;
      case 'Filter': return <Filter className="w-8 h-8" />;
      case 'FlaskConical': return <FlaskConical className="w-8 h-8" />;
      case 'BookOpen': return <BookOpen className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-12">
      <div className="w-full h-full flex flex-col justify-between max-w-[920px] mx-auto space-y-8">
        {/* Page Title Header */}
        <div className="space-y-4 text-left shrink-0">
          <h2 className="text-4xl md:text-6xl font-black text-brand-700 tracking-tight">
            ¿Qué solución necesitas?
          </h2>
          <p className="text-xl md:text-3xl text-brand-500 font-medium leading-relaxed">
            Selecciona una categoría para conocer productos, aplicaciones y brochures técnicos.
          </p>
        </div>

        {/* 6 Category Cards Grid (Portrait 2 Columns for 1080x1920) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 my-auto flex-1 content-center">
          {[...categories].sort((a, b) => {
            const na = parseInt(a.code, 10) || 0;
            const nb = parseInt(b.code, 10) || 0;
            return na !== nb ? na - nb : a.code.localeCompare(b.code);
          }).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="group relative bg-white hover:bg-slate-50 active:bg-slate-100 p-8 rounded-3xl border-2 border-marco-border hover:border-accent-500/70 transition-all text-left shadow-md hover:shadow-xl flex items-center gap-6 min-h-[160px] lg:min-h-[180px] active:scale-[0.98] touch-manipulation"
            >
              {/* Category Code Box (LU, HH, TM, FI, ML, MM) */}
              <div
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center font-black text-2xl lg:text-3xl text-brand-700 shrink-0 shadow-inner border border-slate-200"
                style={{ backgroundColor: '#e2e8f0' }}
              >
                {cat.code}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl lg:text-3xl font-black text-brand-700 group-hover:text-accent-600 transition-colors line-clamp-1">
                    {cat.title}
                  </h3>
                  <ChevronRight className="w-10 h-10 text-brand-300 group-hover:text-accent-500 group-hover:translate-x-1.5 transition-all shrink-0" />
                </div>
                <p className="text-lg lg:text-xl text-brand-500 mt-2 line-clamp-2 leading-relaxed">
                  {cat.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Secondary Action Buttons (Ergonomic Touch Targets > 100px) */}
        <div className="space-y-6 pt-6 shrink-0">
          {/* Route A Button */}
          <button
            type="button"
            onClick={onNotFoundRoute}
            className="w-full py-6 px-8 min-h-[100px] bg-white hover:bg-slate-50 active:bg-slate-100 text-brand-700 font-extrabold text-2xl tracking-wide rounded-2xl border-2 border-marco-border hover:border-brand-400 flex items-center justify-center gap-4 transition shadow-md touch-cta"
          >
            <Search className="w-8 h-8 text-brand-500 shrink-0" />
            <span>NO ENCONTRÉ LO QUE BUSCABA</span>
          </button>

          {/* Route B Button */}
          <button
            type="button"
            onClick={onSpecialistRoute}
            className="w-full py-6 px-8 min-h-[100px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-2xl lg:text-3xl tracking-wider rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-4 transition shadow-xl touch-cta"
          >
            <UserCheck className="w-9 h-9 text-white shrink-0" />
            <span>QUIERO HABLAR CON UN ESPECIALISTA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

