import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ChevronRight, ChevronLeft, Cpu, Layers, ShieldCheck } from 'lucide-react';
import marcoLogo from '../../assets/img/Logo Marco fondo oscuro.png';
import fondo1 from '../../assets/fondo/imgi_33_Apache-fondo.min.jpg';
import fondo2 from '../../assets/fondo/imgi_35_Fondo-Marco-Lab.min.png';
import fondo3 from '../../assets/fondo/imgi_36_Fondo-Marco-Peruana.min.png';

interface AttractionScreenProps {
  onStart: () => void;
  companyName?: string;
  eventTitle?: string;
}

export const AttractionScreen: React.FC<AttractionScreenProps> = ({
  onStart,
  companyName = 'MARCO Peru',
  eventTitle = 'Expomina 2026'
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const backgroundSlides = [
    {
      image: fondo1,
      tag: 'LUBRICACIÓN DE ALTO DESEMPEÑO',
      desc: 'Soluciones Bel-Ray para minería pesada y plantas concentradoras'
    },
    {
      image: fondo2,
      tag: 'HERRAMIENTAS HIDRÁULICAS',
      desc: 'Sistemas Power Team de alta presión hasta 10,000 PSI'
    },
    {
      image: fondo3,
      tag: 'FILTRACIÓN & DIAGNÓSTICO',
      desc: 'MARCO Lab y purificación Lube & Fuel en tiempo real'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % backgroundSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgroundSlides.length, activeSlide]); // Reset timer if manually changed

  return (
    <div
      onClick={onStart}
      className="relative flex-1 w-full h-full bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white flex flex-col justify-between p-6 md:p-10 cursor-pointer overflow-hidden select-none group"
    >
      {/* Background Image Carousel with dark overlay */}
      {backgroundSlides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeSlide ? 'opacity-30 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img
            src={slide.image}
            alt={slide.tag}
            className="w-full h-full object-cover filter contrast-125 saturate-110"
          />
        </div>
      ))}

      {/* Dark Gradient Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/85 via-brand-800/90 to-brand-950/95 z-10 pointer-events-none"></div>

      {/* Top Header Badge */}
      <div className="relative z-20 flex items-center justify-between border-b border-brand-600/80 pb-4">
        <div className="flex items-center gap-4">
          <img
            src={marcoLogo}
            alt="MARCO"
            className="w-auto h-8 md:h-10 object-contain"
          />
          <div className="h-8 border-l-2 border-brand-500/50"></div>
          <span className="font-extrabold text-2xl tracking-tight text-accent-400 block leading-none mt-1">
            Explorer
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-brand-800/80 border border-accent-500/60 rounded-full text-sm font-bold text-accent-300">
          <Sparkles className="w-4 h-4 text-accent-400 animate-pulse" />
          <span>Tótem Interactivo</span>
        </div>
      </div>
      
      {/* Center Hero Block as Wireframe Page 3 */}
      <div className="relative z-20 my-auto text-center max-w-2xl mx-auto space-y-6 py-6">
        {/* Big Logo */}
        <img
          src={marcoLogo}
          alt="MARCO"
          className="w-full max-w-md md:max-w-xl h-auto object-contain mx-auto mb-10"
        />

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800/90 border border-brand-600 rounded-full text-xs font-mono text-brand-100">
          <Cpu className="w-4 h-4 text-accent-400" />
          <span>SOLUCIONES INTEGRALES PARA LA INDUSTRIA</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
            CREAMOS SOLUCIONES
          </h1>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-100 tracking-tight">
            CON LA ÚLTIMA TECNOLOGÍA PARA LA INDUSTRIA
          </h2>
        </div>

        <p className="text-lg text-brand-100 font-medium max-w-md mx-auto">
          Toca la pantalla para descubrir nuestras soluciones
        </p>

        {/* Slide Category Tag Indicator */}
        <div className="inline-block px-4 py-1.5 bg-brand-800/60 border border-accent-600/80 rounded-lg text-xs font-semibold text-accent-300 uppercase tracking-wider">
          {backgroundSlides[activeSlide].tag}
        </div>

        {/* Big Touch CTA Button (Height > 80px as requested in specs) */}
        <div className="pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="w-full max-w-md mx-auto py-5 px-8 min-h-[84px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-brand-900 font-extrabold text-2xl tracking-wider rounded-2xl border-2 border-accent-300 shadow-[0_10px_30px_rgba(0,180,230,0.5)] flex items-center justify-center gap-4 transition-all transform group-hover:scale-[1.02] active:scale-95 touch-cta"
          >
            <Play className="w-8 h-8 fill-brand-900" />
            <span>EMPEZAR</span>
            <ChevronRight className="w-8 h-8 text-brand-800" />
          </button>
        </div>
      </div>

      {/* Slider Navigation Dots */}
      <div className="relative z-20 pb-4 flex justify-center gap-3">
        {backgroundSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide(idx);
            }}
            className={`w-12 h-2 rounded-full transition-all duration-300 ${
              idx === activeSlide ? 'bg-accent-400' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Ir a la diapositiva ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slider Arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide((prev) => (prev === 0 ? backgroundSlides.length - 1 : prev - 1));
        }}
        className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 w-16 h-16 bg-[#0b1121] hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-xl"
      >
        <ChevronLeft className="w-8 h-8 pr-1" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide((prev) => (prev + 1) % backgroundSlides.length);
        }}
        className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 w-16 h-16 bg-[#0b1121] hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-xl"
      >
        <ChevronRight className="w-8 h-8 pl-1" strokeWidth={3} />
      </button>

      {/* Bottom Footer Information */}
      <div className="relative z-20 border-t border-brand-600/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-200 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Layers className="w-4 h-4 text-accent-400" /> 6 Líneas de Negocio
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-accent-400" /> Catalogado Offline
          </span>
        </div>

        <div className="text-center sm:text-right font-medium text-brand-200">
          <span>Reinicio automático tras inactividad</span>
        </div>
      </div>
    </div>
  );
};
