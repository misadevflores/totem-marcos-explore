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
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-10">
      <div className="w-full h-full flex flex-col justify-between max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2 text-left shrink-0">
          <div className="inline-block px-4 py-1.5 bg-brand-100 border border-brand-200 rounded-xl text-xs sm:text-sm font-black text-brand-700">
            Ruta A · Requerimiento Directo
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-brand-700 tracking-tight pt-1">
            ¿Cómo podemos ayudarte?
          </h2>
          <p className="text-sm md:text-lg text-brand-500 font-medium">
            Selecciona una opción para canalizar tu requerimiento técnico de manera personalizada.
          </p>
        </div>

        {/* Options Radio List */}
        <div className="space-y-3.5 my-auto">
          {options.map((opt) => {
            const isSelected = selectedOption === opt;
            return (
              <div
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-4 select-none min-h-[72px] ${
                  isSelected
                    ? 'bg-brand-800 border-accent-500 text-white font-black shadow-lg'
                    : 'bg-white hover:bg-slate-50 border-marco-border text-brand-700 font-bold shadow-sm'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-7 h-7 text-accent-400 shrink-0" />
                ) : (
                  <Circle className="w-7 h-7 text-brand-300 shrink-0" />
                )}
                <span className="text-lg sm:text-xl">{opt}</span>
              </div>
            );
          })}

          {/* Text Area Description */}
          <div className="pt-2 space-y-2">
            <label className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent-600" />
              Describe brevemente tu necesidad (opcional)
            </label>
            <textarea
              rows={3}
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              onFocus={() => onActiveInputFocus?.('detailText')}
              placeholder="Ej. Busco un sistema de filtración dializado para aceite hidráulico de chancadora..."
              className="w-full p-5 bg-white border-2 border-marco-border focus:border-accent-500 rounded-2xl text-brand-800 font-bold text-base sm:text-lg placeholder-brand-300 outline-none transition resize-none shadow-sm"
            ></textarea>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4 shrink-0">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-5 px-8 min-h-[84px] lg:min-h-[92px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-2xl tracking-wider rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-4 transition shadow-2xl touch-cta"
          >
            <span>CONTINUAR</span>
            <ArrowRight className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
