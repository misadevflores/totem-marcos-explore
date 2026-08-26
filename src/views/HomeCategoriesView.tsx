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
    <div className="flex-1 flex flex-col justify-between items-center bg-marco-bg text-brand-800 overflow-y-auto">
      <div className="w-full h-full flex flex-col p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Page Title Header */}
      <div className="space-y-2 text-left">
        <h2 className="text-3xl md:text-4xl font-black text-brand-700 tracking-tight">
          ¿Qué solución necesitas?
        </h2>
        <p className="text-base text-brand-500 font-medium">
          Selecciona una categoría para conocer productos, aplicaciones y brochures.
        </p>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 my-auto">
        {[...categories].sort((a, b) => {
          const na = parseInt(a.code, 10) || 0;
          const nb = parseInt(b.code, 10) || 0;
          return na !== nb ? na - nb : a.code.localeCompare(b.code);
        }).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className="group relative bg-white hover:bg-marco-bg active:bg-white p-5 rounded-2xl border-2 border-marco-border hover:border-accent-500/60 transition-all text-left shadow-lg flex items-center gap-4 min-h-[100px] active:scale-[0.98]"
          >
            {/* Category Code Box (LU, HH, TM, FI, ML, MM) */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl text-brand-600 shrink-0 shadow-inner"
              style={{ backgroundColor: '#E2E8F0' }}
            >
              {cat.code}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-700 group-hover:text-accent-600 transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <ChevronRight className="w-6 h-6 text-brand-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-xs text-brand-500 mt-1 line-clamp-2 leading-snug">
                {cat.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Secondary Action Buttons (Wireframe Page 4 bottom buttons) */}
      <div className="space-y-3 pt-2">
        {/* Route A Button */}
        <button
          type="button"
          onClick={onNotFoundRoute}
          className="w-full py-4 px-6 min-h-[68px] bg-white hover:bg-marco-bg active:bg-white text-brand-700 font-extrabold text-base tracking-wide rounded-xl border-2 border-marco-border hover:border-brand-300 flex items-center justify-center gap-3 transition shadow"
        >
          <Search className="w-5 h-5 text-brand-400" />
          <span>NO ENCONTRÉ LO QUE BUSCABA</span>
        </button>

        {/* Route B Button */}
        <button
          type="button"
          onClick={onSpecialistRoute}
          className="w-full py-4 px-6 min-h-[72px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-extrabold text-lg tracking-wider rounded-xl border border-accent-300 flex items-center justify-center gap-3 transition shadow-lg"
        >
          <UserCheck className="w-6 h-6 text-white" />
          <span>QUIERO HABLAR CON UN ESPECIALISTA</span>
        </button>
      </div>
    </div>
  </div>
  );
};

