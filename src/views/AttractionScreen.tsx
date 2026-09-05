import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ChevronRight, ChevronLeft, Cpu, Layers, ShieldCheck } from 'lucide-react';
import marcoLogo from '../../assets/imgi_1_logo-marco-blanco.svg';
import marcoLogoDark from '../../assets/img/Logo Marco fondo oscuro.png';
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
      className="relative w-full h-full min-h-[100dvh] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 cursor-pointer overflow-hidden select-none group"
    >
      {/* Background Image Carousel with dark overlay */}
      {backgroundSlides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeSlide ? 'opacity-35 scale-105' : 'opacity-0 scale-100'
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
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/85 via-brand-900/90 to-brand-950/95 z-10 pointer-events-none"></div>

      {/* Top Header Badge */}
      <div className="relative z-20 flex items-center justify-between border-b border-brand-600/70 pb-5 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img
            src={marcoLogo}
            alt="MARCO"
            className="w-auto h-14 sm:h-20 lg:h-24 object-contain"
          />
          <div className="h-8 sm:h-12 border-l-2 border-brand-500/50"></div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base tracking-widest text-accent-400 uppercase">
              Explorer
            </span>
            <span className="text-xs sm:text-sm text-brand-200 font-bold">
              {eventTitle}
            </span>
          </div>
        </div>

        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-xs sm:text-sm font-bold text-brand-100">
          Tótem Interactivo
        </div>
      </div>
      
      {/* Center Hero Block (Optimized for 1080x1920 Portrait) */}
      <div className="relative z-20 my-auto text-center max-w-[920px] mx-auto space-y-12 py-4">
        {/* Big Logo */}
        <img
          src={marcoLogoDark}
          alt="MARCO"
          className="w-full max-w-lg sm:max-w-2xl lg:max-w-3xl h-auto object-contain mx-auto"
        />

        <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-800/90 border border-brand-500/80 rounded-full text-sm sm:text-base font-mono text-brand-100 shadow-md">
          <Cpu className="w-5 h-5 text-accent-400" />
          <span className="tracking-wider">SOLUCIONES INTEGRALES PARA LA INDUSTRIA</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-md">
            CREAMOS SOLUCIONES
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-accent-300 tracking-tight leading-snug">
            CON LA ÚLTIMA TECNOLOGÍA PARA LA INDUSTRIA
          </h2>
        </div>

        <p className="text-xl sm:text-3xl text-brand-100 font-medium max-w-2xl mx-auto leading-relaxed">
          Toca la pantalla para descubrir nuestro catálogo y asesoría técnica
        </p>

        {/* Slide Category Tag Indicator */}
        <div className="inline-block px-6 py-3 bg-brand-800/80 border border-accent-500/80 rounded-2xl text-sm sm:text-base font-bold text-accent-300 uppercase tracking-widest shadow-inner">
          {backgroundSlides[activeSlide].tag}
        </div>

        {/* Big Touch CTA Button (Height > 100px for 55" display) */}
        <div className="pt-6 max-w-xl mx-auto w-full">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="w-full py-8 px-10 min-h-[120px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-brand-950 font-black text-3xl lg:text-4xl tracking-wider rounded-3xl border-2 border-accent-300 shadow-[0_15px_40px_rgba(0,180,230,0.45)] flex items-center justify-center gap-6 transition-all transform group-hover:scale-[1.02] active:scale-95 touch-cta"
          >
            <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-brand-950" />
            <span>EMPEZAR</span>
            <ChevronRight className="w-10 h-10 sm:w-12 sm:h-12 text-brand-900" />
          </button>
        </div>
      </div>

      {/* Slider Navigation Dots */}
      <div className="relative z-20 pb-4 flex justify-center gap-3 shrink-0">
        {backgroundSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide(idx);
            }}
            className={`w-14 h-2.5 rounded-full transition-all duration-300 ${
              idx === activeSlide ? 'bg-accent-400 shadow-[0_0_10px_rgba(0,180,230,0.8)]' : 'bg-white/30 hover:bg-white/50'
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
        className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 z-30 w-16 h-16 sm:w-20 sm:h-20 bg-brand-900/90 hover:bg-brand-800 text-white rounded-full flex items-center justify-center transition-colors shadow-2xl border border-white/20 active:scale-90"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="w-9 h-9 pr-1" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide((prev) => (prev + 1) % backgroundSlides.length);
        }}
        className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-30 w-16 h-16 sm:w-20 sm:h-20 bg-brand-900/90 hover:bg-brand-800 text-white rounded-full flex items-center justify-center transition-colors shadow-2xl border border-white/20 active:scale-90"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="w-9 h-9 pl-1" strokeWidth={3} />
      </button>

      {/* Bottom Footer Information */}
      <div className="relative z-20 border-t border-brand-600/70 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-brand-200 gap-3 shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-semibold">
            <Layers className="w-5 h-5 text-accent-400" /> 6 Líneas de Soluciones
          </span>
          <span className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-5 h-5 text-accent-400" /> Operación Offline
          </span>
        </div>

        <div className="text-center sm:text-right font-medium text-brand-300">
          <span>Toca en cualquier parte para interactuar</span>
        </div>
      </div>
    </div>
  );
};
