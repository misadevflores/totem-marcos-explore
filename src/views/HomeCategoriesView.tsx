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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-slate-900 text-white overflow-y-auto">
      {/* Page Title Header */}
      <div className="space-y-2 text-left">
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          ¿Qué solución necesitas?
        </h2>
        <p className="text-base text-slate-300 font-medium">
          Selecciona una categoría para conocer productos, aplicaciones y brochures.
        </p>
      </div>

      {/* 6 Category Cards Grid (Big touch cards as specified in Wireframe Page 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className="group relative bg-slate-800/90 hover:bg-slate-800 active:bg-slate-700 p-5 rounded-2xl border-2 border-slate-700/80 hover:border-red-600/80 transition-all text-left shadow-lg flex items-center gap-4 min-h-[100px] active:scale-[0.98]"
          >
            {/* Category Code Box (LU, HH, TM, FI, ML, MM) */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl text-red-900 shrink-0 shadow-inner"
              style={{ backgroundColor: '#FDF2F4' }}
            >
              {cat.code}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-snug">
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
          className="w-full py-4 px-6 min-h-[68px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-extrabold text-base tracking-wide rounded-xl border border-slate-600 flex items-center justify-center gap-3 transition shadow"
        >
          <Search className="w-5 h-5 text-slate-400" />
          <span>NO ENCONTRÉ LO QUE BUSCABA</span>
        </button>

        {/* Route B Button */}
        <button
          type="button"
          onClick={onSpecialistRoute}
          className="w-full py-4 px-6 min-h-[72px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-extrabold text-lg tracking-wider rounded-xl border border-red-600 flex items-center justify-center gap-3 transition shadow-lg"
        >
          <UserCheck className="w-6 h-6 text-red-200" />
          <span>QUIERO HABLAR CON UN ESPECIALISTA</span>
        </button>
      </div>
    </div>
  );
};
