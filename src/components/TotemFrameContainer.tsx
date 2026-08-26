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
    <div className="min-h-screen bg-marco-bg text-brand-800 flex flex-col justify-between font-sans selection:bg-accent-500 selection:text-white overflow-x-hidden">
      {/* Top Simulator Control Bar */}
      <div className="bg-brand-800 border-b border-brand-700 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-100 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse"></span>
            Tótem Táctil MARCO Explorer
          </div>
          <span className="text-brand-300 hidden sm:inline">|</span>
          <span className="text-brand-200 hidden sm:inline">Resolución objetivo: 1080 × 1920 px (Pantalla 55" Vertical)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Frame mode toggle button */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ totemFrameMode: !settings.totemFrameMode })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition ${
              settings.totemFrameMode
                ? 'bg-accent-600 border-accent-400 text-white'
                : 'bg-brand-700 border-brand-600 text-brand-100 hover:bg-brand-600'
            }`}
          >
            {settings.totemFrameMode ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-white" />
                <span>Vista Marco Tótem 55"</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-brand-200" />
                <span>Vista Pantalla Completa</span>
              </>
            )}
          </button>

          {/* Hardware Specifications trigger */}
          <button
            type="button"
            onClick={() => setShowSpecsModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-700 hover:bg-brand-600 border border-brand-600 rounded-lg text-brand-100 transition"
          >
            <Info className="w-3.5 h-3.5 text-accent-400" />
            <span className="hidden md:inline">Hardware Tótem LCD</span>
          </button>

          {/* Reset Session */}
          <button
            type="button"
            onClick={onResetSession}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-700 hover:bg-brand-600 border border-brand-600 rounded-lg text-brand-100 transition"
            title="Reiniciar a Pantalla de Atracción"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent-400" />
            <span className="hidden md:inline">Reiniciar</span>
          </button>

          {/* Admin Panel button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent-600 hover:bg-accent-500 border border-accent-400 text-white rounded-lg font-bold transition"
          >
            <Settings className="w-3.5 h-3.5 text-white" />
            <span>Panel Admin</span>
          </button>
        </div>
      </div>

{/* Main Content Render Area */}
      <div className="flex-1 flex items-center justify-center p-0 overflow-hidden bg-brand-900/10">
        <div 
          className={`w-full h-full bg-marco-bg overflow-hidden flex flex-col transition-all duration-300 relative mx-auto ${
            settings.totemFrameMode 
              ? 'max-w-[1080px] shadow-[0_0_60px_rgba(0,0,0,0.15)]' 
              : 'max-w-none'
          }`}
        >
          {children}
        </div>
      </div>

{/* Hardware Specifications Modal */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-marco-border rounded-2xl max-w-2xl w-full p-6 text-brand-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-marco-border pb-3">
              <h3 className="text-xl font-bold text-brand-700 flex items-center gap-2">
                <Info className="w-6 h-6 text-accent-600" />
                Especificaciones de Hardware del Tótem LCD
              </h3>
              <button
                onClick={() => setShowSpecsModal(false)}
                className="px-3 py-1 bg-brand-700 hover:bg-brand-600 rounded-lg text-sm text-white font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-marco-bg p-4 rounded-xl border border-marco-border space-y-2">
                <h4 className="font-bold text-accent-600 uppercase text-xs tracking-wider">Pantalla & Panel</h4>
                <p><strong>Diagonal:</strong> 55" LED Táctil</p>
                <p><strong>Resolución Base:</strong> 1080 × 1920 Full HD Vertical</p>
                <p><strong>Relación de Aspecto:</strong> 16:9 (Orientación Vertical)</p>
                <p><strong>Luminosidad:</strong> 350 cd/m²</p>
                <p><strong>Contraste:</strong> 4000:1</p>
                <p><strong>Ángulo de Visión:</strong> 178°</p>
              </div>

              <div className="bg-marco-bg p-4 rounded-xl border border-marco-border space-y-2">
                <h4 className="font-bold text-accent-600 uppercase text-xs tracking-wider">Hardware & Sistema</h4>
                <p><strong>Chipset:</strong> Ultra RK3288 Quad-Core</p>
                <p><strong>Memoria RAM:</strong> 8GB RAM</p>
                <p><strong>Almacenamiento (ROM):</strong> 128GB ROM Local</p>
                <p><strong>Sistema Operativo:</strong> Android 10</p>
                <p><strong>Respuesta Táctil:</strong> Clic 8ms / Continuo 3ms</p>
                <p><strong>Dimensiones Totales:</strong> 73.3 x 190.3 cm</p>
              </div>
            </div>

            <div className="bg-brand-700 border border-brand-600 p-4 rounded-xl text-xs text-brand-100 space-y-1">
              <p className="font-bold text-accent-400">Requerimientos de Interfaz cumplidos:</p>
              <ul className="list-disc list-inside space-y-1 text-brand-100">
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
