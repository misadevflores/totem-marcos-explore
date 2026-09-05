import React, { useEffect, useState } from 'react';
import { Specialist } from '../types';
import { UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SpecialistRouteViewProps {
  specialists: Specialist[];
  onSelectSpecialist: (specialist: Specialist) => void;
}

export const SpecialistRouteView: React.FC<SpecialistRouteViewProps> = ({
  specialists,
  onSelectSpecialist
}) => {
  // Ordenar especialistas por el código numérico implícito en su ID (spec-1 ... spec-12)
  const sortedSpecialists = [...specialists].sort((a, b) => {
    const na = parseInt(a.id.replace('spec-', ''), 10) || 0;
    const nb = parseInt(b.id.replace('spec-', ''), 10) || 0;
    return na !== nb ? na - nb : a.title.localeCompare(b.title);
  });

  const [selectedSpec, setSelectedSpec] = useState<Specialist | null>(sortedSpecialists[0] ?? null);

  useEffect(() => {
    setSelectedSpec(sortedSpecialists[0] ?? null);
  }, [specialists]);

  if (!selectedSpec) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-marco-bg text-brand-500">
        No hay especialistas configurados en totem-marco.
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-10">
      <div className="w-full h-full flex flex-col justify-between max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2 text-left shrink-0">
          <div className="inline-block px-4 py-1.5 bg-brand-100 border border-brand-200 rounded-xl text-xs sm:text-sm font-black text-brand-700">
            Ruta B · Especialistas Técnicos
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-brand-700 tracking-tight pt-1">
            Selecciona el área de interés
          </h2>
          <p className="text-sm md:text-lg text-brand-500 font-medium">
            El contacto se asignará internamente con el especialista del rubro correspondiente.
          </p>
        </div>

        {/* Area Cards List */}
        <div className="space-y-3.5 my-auto">
          {sortedSpecialists.map((spec) => {
            const isSelected = selectedSpec.id === spec.id;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedSpec(spec)}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-5 select-none shadow-sm min-h-[80px] ${
                  isSelected
                    ? 'bg-brand-800 border-accent-500 shadow-xl text-white'
                    : 'bg-white hover:bg-slate-50 border-marco-border text-brand-700'
                }`}
              >
                {/* Arrow Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 transition ${
                    isSelected ? 'bg-accent-500 text-white shadow-md' : 'bg-brand-100 text-brand-600 border border-brand-200'
                  }`}
                >
                  →
                </div>

                {/* Specialist Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-black text-lg sm:text-xl line-clamp-1 ${isSelected ? 'text-white' : 'text-brand-700'}`}>{spec.title}</h3>
                  <p className={`text-xs sm:text-sm mt-1 ${isSelected ? 'text-accent-300' : 'text-brand-500 font-medium'}`}>{spec.role}</p>
                </div>

                {isSelected && <CheckCircle2 className="w-8 h-8 text-accent-400 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Internal Assignment Note */}
        <div className="bg-brand-100 border border-brand-200 p-4 rounded-2xl text-xs sm:text-sm text-brand-700 font-bold flex items-start gap-3 shrink-0">
          <ShieldCheck className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
          <span>
            El contacto se asigna internamente según la línea seleccionada. El visitante no necesita elegir una persona específica.
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-4 shrink-0">
          <button
            type="button"
            onClick={() => onSelectSpecialist(selectedSpec)}
            className="w-full py-5 px-8 min-h-[84px] lg:min-h-[92px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-2xl tracking-wider rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-4 transition shadow-2xl touch-cta"
          >
            <UserCheck className="w-7 h-7 text-white" />
            <span>DEJAR MIS DATOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
