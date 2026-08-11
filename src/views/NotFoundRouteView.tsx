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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-marco-bg text-brand-800 overflow-y-auto">
      {/* Title */}
      <div className="space-y-1 text-left">
        <div className="inline-block px-3 py-1 bg-brand-100 border border-brand-200 rounded-md text-xs font-bold text-brand-700">
          Ruta A · Requerimiento Directo
        </div>
        <h2 className="text-3xl font-black text-brand-700 tracking-tight pt-1">
          ¿Cómo podemos ayudarte?
        </h2>
        <p className="text-xs text-brand-400">
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
                  ? 'bg-brand-700 border-accent-500 text-white font-bold'
                  : 'bg-white hover:bg-marco-bg border-marco-border text-brand-700 font-medium'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-6 h-6 text-accent-400 shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-brand-300 shrink-0" />
              )}
              <span className="text-base">{opt}</span>
            </div>
          );
        })}

        {/* Text Area Description */}
        <div className="pt-2 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-accent-600" />
            Describe brevemente tu necesidad
          </label>
          <textarea
            rows={3}
            value={detailText}
            onChange={(e) => setDetailText(e.target.value)}
            onFocus={() => onActiveInputFocus?.('detailText')}
            placeholder="Ej. Busco un sistema de filtración dializado para aceite hidráulico de chancadora..."
            className="w-full p-4 bg-white border-2 border-marco-border focus:border-accent-500 rounded-xl text-brand-800 font-medium text-sm placeholder-brand-300 outline-none transition resize-none"
          ></textarea>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-5 px-6 min-h-[76px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-extrabold text-xl tracking-wider rounded-xl border border-accent-300 flex items-center justify-center gap-3 transition shadow-xl"
        >
          <span>CONTINUAR</span>
          <ArrowRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};
