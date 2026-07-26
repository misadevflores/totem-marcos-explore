import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, HelpCircle } from 'lucide-react';

interface NotFoundRouteViewProps {
  onContinue: (requirementType: string, detail: string) => void;
  onActiveInputFocus?: (fieldKey: string) => void;
}

export const NotFoundRouteView: React.FC<NotFoundRouteViewProps> = ({
  onContinue,
  onActiveInputFocus
}) => {
  const options = [
    'Necesito una cotización',
    'Busco un producto específico',
    'Necesito asesoría técnica',
    'Quiero conocer al especialista',
    'Otro requerimiento'
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [detailText, setDetailText] = useState('');

  const handleNext = () => {
    onContinue(selectedOption, detailText.trim());
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-slate-900 text-white overflow-y-auto">
      {/* Title */}
      <div className="space-y-1 text-left">
        <div className="inline-block px-3 py-1 bg-red-950 border border-red-800 rounded-md text-xs font-bold text-red-300">
          Ruta A · Requerimiento Directo
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight pt-1">
          ¿Cómo podemos ayudarte?
        </h2>
        <p className="text-xs text-slate-400">
          Selecciona una opción. Después te pediremos únicamente los datos necesarios.
        </p>
      </div>

      {/* Options Radio List (Wireframe Page 9) */}
      <div className="space-y-2.5 my-auto">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          return (
            <div
              key={opt}
              onClick={() => setSelectedOption(opt)}
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center gap-3.5 select-none ${
                isSelected
                  ? 'bg-red-950/70 border-red-600 text-white font-bold'
                  : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 font-medium'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-6 h-6 text-red-500 shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-slate-500 shrink-0" />
              )}
              <span className="text-base">{opt}</span>
            </div>
          );
        })}

        {/* Text Area Description */}
        <div className="pt-2 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-red-400" />
            Describe brevemente tu necesidad
          </label>
          <textarea
            rows={3}
            value={detailText}
            onChange={(e) => setDetailText(e.target.value)}
            onFocus={() => onActiveInputFocus?.('detailText')}
            placeholder="Ej. Busco un sistema de filtración dializado para aceite hidráulico de chancadora..."
            className="w-full p-4 bg-slate-800 border-2 border-slate-700 focus:border-red-500 rounded-xl text-white font-medium text-sm placeholder-slate-500 outline-none transition resize-none"
          ></textarea>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-5 px-6 min-h-[76px] bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-extrabold text-xl tracking-wider rounded-xl border border-red-600 flex items-center justify-center gap-3 transition shadow-xl"
        >
          <span>CONTINUAR</span>
          <ArrowRight className="w-6 h-6 text-red-200" />
        </button>
      </div>
    </div>
  );
};
