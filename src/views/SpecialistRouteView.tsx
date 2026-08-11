import React, { useState } from 'react';
import { Specialist } from '../types';
import { INITIAL_SPECIALISTS } from '../data/mockCatalog';
import { UserCheck, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SpecialistRouteViewProps {
  specialists?: Specialist[];
  onSelectSpecialist: (specialist: Specialist) => void;
}

export const SpecialistRouteView: React.FC<SpecialistRouteViewProps> = ({
  specialists = INITIAL_SPECIALISTS,
  onSelectSpecialist
}) => {
  const [selectedSpec, setSelectedSpec] = useState<Specialist>(specialists[0]);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-marco-bg text-brand-800 overflow-y-auto">
      {/* Title */}
      <div className="space-y-1 text-left">
        <div className="inline-block px-3 py-1 bg-brand-100 border border-brand-200 rounded-md text-xs font-bold text-brand-700">
          Ruta B · Especialistas Técnicos
        </div>
        <h2 className="text-3xl font-black text-brand-700 tracking-tight pt-1">
          Selecciona el área de interés
        </h2>
        <p className="text-xs text-brand-400">
          El contacto se asigna internamente según la línea seleccionada.
        </p>
      </div>

      {/* Area Cards List (Wireframe Page 10) */}
      <div className="space-y-3 my-auto">
        {specialists.map((spec) => {
          const isSelected = selectedSpec.id === spec.id;
          return (
            <div
              key={spec.id}
              onClick={() => setSelectedSpec(spec)}
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center gap-4 select-none shadow-sm ${
                isSelected
                  ? 'bg-brand-700 border-accent-500 shadow-lg'
                  : 'bg-white hover:bg-marco-bg border-marco-border'
              }`}
            >
              {/* Arrow Badge */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 transition ${
                  isSelected ? 'bg-accent-500 text-white' : 'bg-brand-100 text-brand-500'
                }`}
              >
                →
              </div>

              {/* Specialist Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-base line-clamp-1 ${isSelected ? 'text-white' : 'text-brand-700'}`}>{spec.title}</h3>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-brand-100' : 'text-brand-500'}`}>{spec.role}</p>
              </div>

              {isSelected && <CheckCircle2 className="w-6 h-6 text-accent-400 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Internal Assignment Note */}
      <div className="bg-brand-100 border border-brand-200 p-3.5 rounded-xl text-xs text-brand-700 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
        <span>
          El contacto se asigna internamente según la línea seleccionada. El visitante no necesita elegir una persona específica.
        </span>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onSelectSpecialist(selectedSpec)}
          className="w-full py-5 px-6 min-h-[76px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-extrabold text-xl tracking-wider rounded-xl border border-accent-300 flex items-center justify-center gap-3 transition shadow-xl"
        >
          <UserCheck className="w-6 h-6 text-white" />
          <span>DEJAR MIS DATOS</span>
        </button>
      </div>
    </div>
  );
};
