import React, { useState } from 'react';
import { Smartphone, Monitor, RefreshCw, Settings, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showSimulatorBar, setShowSimulatorBar] = useState(false);

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh] bg-marco-bg text-brand-800 flex flex-col font-sans selection:bg-accent-500 selection:text-white overflow-hidden relative select-none kiosk-container">
      {/* Top Floating Simulator Control Bar (Collapsible to preserve 100% of 1080x1920 screen) */}
      {showSimulatorBar ? (
        <div className="bg-brand-900/95 backdrop-blur-md border-b border-brand-700 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-100 z-50 shrink-0 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse"></span>
              Tótem Táctil MARCO Explorer
            </div>
            <span className="text-brand-300 hidden sm:inline">|</span>
            <span className="text-brand-200 hidden sm:inline">Modo Kiosco: 1080 × 1920 px (55" Vertical)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Simulator Bar */}
            <button
              type="button"
              onClick={() => setShowSimulatorBar(false)}
              className="flex items-center gap-1 px-2.5 py-1 bg-brand-800 hover:bg-brand-700 border border-brand-600 rounded-lg text-brand-200 text-xs transition"
              title="Ocultar barra de simulación"
            >
              <ChevronUp className="w-3.5 h-3.5 text-accent-400" />
              <span>Ocultar barra</span>
            </button>

            {/* Hardware Specifications trigger */}
            <button
              type="button"
              onClick={() => setShowSpecsModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-brand-700 hover:bg-brand-600 border border-brand-600 rounded-lg text-brand-100 transition text-xs"
            >
              <Info className="w-3.5 h-3.5 text-accent-400" />
              <span>Hardware</span>
            </button>

            {/* Reset Session */}
            <button
              type="button"
              onClick={onResetSession}
              className="flex items-center gap-1 px-2.5 py-1 bg-brand-700 hover:bg-brand-600 border border-brand-600 rounded-lg text-brand-100 transition text-xs"
              title="Reiniciar a Pantalla de Atracción"
            >
              <RefreshCw className="w-3.5 h-3.5 text-accent-400" />
              <span>Reiniciar</span>
            </button>

            {/* Admin Panel button */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-3 py-1 bg-accent-600 hover:bg-accent-500 border border-accent-400 text-white rounded-lg font-bold transition text-xs"
            >
              <Settings className="w-3.5 h-3.5 text-white" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Content Render Area: 100% Viewport Height & Width */}
      <main className="flex-1 w-full h-full flex flex-col overflow-hidden relative">
        {children}
      </main>

      {/* Hardware Specifications Modal */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-marco-border rounded-3xl max-w-2xl w-full p-8 text-brand-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-marco-border pb-4">
              <h3 className="text-2xl font-black text-brand-700 flex items-center gap-2">
                <Info className="w-7 h-7 text-accent-600" />
                Especificaciones de Hardware del Tótem LCD
              </h3>
              <button
                onClick={() => setShowSpecsModal(false)}
                className="px-4 py-2 bg-brand-700 hover:bg-brand-600 rounded-xl text-sm text-white font-bold transition"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-marco-bg p-5 rounded-2xl border border-marco-border space-y-2">
                <h4 className="font-bold text-accent-600 uppercase text-xs tracking-wider">Pantalla & Panel</h4>
                <p><strong>Diagonal:</strong> 55" LED Táctil Capacitiva</p>
                <p><strong>Resolución Base:</strong> 1080 × 1920 Full HD Vertical</p>
                <p><strong>Orientación:</strong> Portrait (Vertical)</p>
                <p><strong>Luminosidad:</strong> 350 cd/m²</p>
                <p><strong>Contraste:</strong> 4000:1</p>
                <p><strong>Ángulo de Visión:</strong> 178°</p>
              </div>

              <div className="bg-marco-bg p-5 rounded-2xl border border-marco-border space-y-2">
                <h4 className="font-bold text-accent-600 uppercase text-xs tracking-wider">Hardware & Sistema</h4>
                <p><strong>Chipset:</strong> Ultra RK3288 Quad-Core</p>
                <p><strong>Memoria RAM:</strong> 8GB RAM</p>
                <p><strong>Almacenamiento (ROM):</strong> 128GB ROM Local</p>
                <p><strong>Sistema Operativo:</strong> Android 10 (Modo Kiosco)</p>
                <p><strong>Respuesta Táctil:</strong> Clic 8ms / Continuo 3ms</p>
                <p><strong>Dimensiones Totales:</strong> 73.3 x 190.3 cm</p>
              </div>
            </div>

            <div className="bg-brand-700 border border-brand-600 p-5 rounded-2xl text-xs text-brand-100 space-y-2">
              <p className="font-bold text-accent-400 text-sm">Requerimientos de Interfaz cumplidos:</p>
              <ul className="list-disc list-inside space-y-1 text-brand-100 text-sm">
                <li>Botones con altura mínima táctil de 80-100px.</li>
                <li>Operación completa Offline con almacenamiento local.</li>
                <li>Reinicio automático a pantalla de atracción tras inactividad.</li>
                <li>Exportación local de datos de leads a archivo Excel (XLSX).</li>
                <li>Bloqueo nativo de selección de texto y overscroll pull-to-refresh.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
