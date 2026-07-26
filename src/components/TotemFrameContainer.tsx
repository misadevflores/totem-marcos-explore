import React, { useState } from 'react';
import { Smartphone, Monitor, RefreshCw, Settings, Info, Maximize2 } from 'lucide-react';
import { KioskSettings } from '../types';

interface TotemFrameContainerProps {
  children: React.ReactNode;
  settings: KioskSettings;
  onUpdateSettings: (newSettings: Partial<KioskSettings>) => void;
  onOpenAdmin: () => void;
  onResetSession: () => void;
}

export const TotemFrameContainer: React.FC<TotemFrameContainerProps> = ({
  children,
  settings,
  onUpdateSettings,
  onOpenAdmin,
  onResetSession
}) => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-red-800 selection:text-white">
      {/* Top Simulator Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Tótem Táctil MARCO Explorer
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Resolución objetivo: 1080 × 1920 px (Pantalla 55" Vertical)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Frame mode toggle button */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ totemFrameMode: !settings.totemFrameMode })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition ${
              settings.totemFrameMode
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {settings.totemFrameMode ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-red-400" />
                <span>Vista Marco Tótem 55"</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-slate-300" />
                <span>Vista Pantalla Completa</span>
              </>
            )}
          </button>

          {/* Hardware Specifications trigger */}
          <button
            type="button"
            onClick={() => setShowSpecsModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Hardware Tótem LCD</span>
          </button>

          {/* Reset Session */}
          <button
            type="button"
            onClick={onResetSession}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
            title="Reiniciar a Pantalla de Atracción"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reiniciar</span>
          </button>

          {/* Admin Panel button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-700/60 text-red-100 rounded-lg font-bold transition"
          >
            <Settings className="w-3.5 h-3.5 text-red-300" />
            <span>Panel Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content Render Area */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-4 overflow-x-hidden">
        {settings.totemFrameMode ? (
          /* Simulated Physical Totem LCD Outer Casing (73x190cm aspect ratio 9:16) */
          <div className="relative w-full max-w-[540px] my-2 aspect-[9/16] bg-black rounded-[36px] p-4 shadow-[0_0_60px_rgba(0,0,0,0.8)] border-4 border-slate-800 flex flex-col justify-between overflow-hidden ring-1 ring-slate-700/50">
            {/* Top camera/sensor notch bar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-2.5 bg-slate-900 rounded-full flex items-center justify-center gap-2 z-50 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
            </div>

            {/* Glass Screen Inner Display */}
            <div className="w-full h-full bg-slate-900 rounded-[24px] overflow-hidden flex flex-col relative shadow-inner border border-slate-800">
              {children}
            </div>

            {/* Bottom Physical Stand Base Plate */}
            <div className="mt-2 text-center text-[10px] uppercase font-mono tracking-widest text-slate-600 flex items-center justify-center gap-2">
              <span>TOTEM LCD INTERIOR 55" TÁCTIL · 1080×1920</span>
            </div>
          </div>
        ) : (
          /* Full Width Responsive View for large screen displays */
          <div className="w-full max-w-5xl my-0 mx-auto min-h-[90vh] bg-slate-900 shadow-2xl rounded-none md:rounded-2xl border-0 md:border border-slate-800 overflow-hidden flex flex-col">
            {children}
          </div>
        )}
      </div>

      {/* Hardware Specifications Modal */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Info className="w-6 h-6 text-red-500" />
                Especificaciones de Hardware del Tótem LCD
              </h3>
              <button
                onClick={() => setShowSpecsModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
                <h4 className="font-bold text-red-400 uppercase text-xs tracking-wider">Pantalla & Panel</h4>
                <p><strong>Diagonal:</strong> 55" LED Táctil</p>
                <p><strong>Resolución Base:</strong> 1080 × 1920 Full HD Vertical</p>
                <p><strong>Relación de Aspecto:</strong> 16:9 (Orientación Vertical)</p>
                <p><strong>Luminosidad:</strong> 350 cd/m²</p>
                <p><strong>Contraste:</strong> 4000:1</p>
                <p><strong>Ángulo de Visión:</strong> 178°</p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
                <h4 className="font-bold text-red-400 uppercase text-xs tracking-wider">Hardware & Sistema</h4>
                <p><strong>Chipset:</strong> Ultra RK3288 Quad-Core</p>
                <p><strong>Memoria RAM:</strong> 8GB RAM</p>
                <p><strong>Almacenamiento (ROM):</strong> 128GB ROM Local</p>
                <p><strong>Sistema Operativo:</strong> Android 10</p>
                <p><strong>Respuesta Táctil:</strong> Clic 8ms / Continuo 3ms</p>
                <p><strong>Dimensiones Totales:</strong> 73.3 x 190.3 cm</p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-xl text-xs text-red-200 space-y-1">
              <p className="font-bold text-red-400">Requerimientos de Interfaz cumplidos:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Botones con altura mínima táctil de 80-100px.</li>
                <li>Operación completa Offline con almacenamiento local.</li>
                <li>Reinicio automático a pantalla de atracción tras inactividad.</li>
                <li>Exportación local de datos de leads a archivo Excel (XLSX).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
