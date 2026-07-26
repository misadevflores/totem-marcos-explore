import React, { useState } from 'react';
import { Delete, ArrowDown, Space, ChevronUp } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  visible: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClose,
  visible
}) => {
  const [caps, setCaps] = useState(false);
  const [mode, setMode] = useState<'qwerty' | 'numeric'>('qwerty');

  if (!visible) return null;

  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '-'];
  const numRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const numRow2 = ['+', '-', '*', '/', '=', '(', ')', '_', '#', '%'];

  const handleKey = (char: string) => {
    onKeyPress(caps ? char.toUpperCase() : char);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md text-white p-4 border-t-2 border-red-700 shadow-2xl animate-in slide-in-from-bottom duration-300 select-none">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Top bar controls */}
        <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Teclado Táctil Tótem
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'qwerty' ? 'numeric' : 'qwerty')}
              className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md font-medium transition"
            >
              {mode === 'qwerty' ? '123 / Símbolos' : 'ABC Letras'}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700/50 rounded-lg transition font-medium"
          >
            <ArrowDown className="w-4 h-4" />
            Ocultar Teclado
          </button>
        </div>

        {/* Keyboard keys */}
        {mode === 'qwerty' ? (
          <div className="space-y-2 pt-1">
            {/* Row 1 */}
            <div className="flex justify-center gap-1.5">
              {row1.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="flex-1 h-12 max-w-[64px] bg-slate-800 hover:bg-red-800 active:bg-red-700 text-lg font-bold rounded-lg border border-slate-700 active:scale-95 transition shadow"
                >
                  {caps ? key.toUpperCase() : key}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-1.5 px-4">
              {row2.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="flex-1 h-12 max-w-[64px] bg-slate-800 hover:bg-red-800 active:bg-red-700 text-lg font-bold rounded-lg border border-slate-700 active:scale-95 transition shadow"
                >
                  {caps ? key.toUpperCase() : key}
                </button>
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setCaps(!caps)}
                className={`px-4 h-12 flex items-center justify-center text-xs font-bold rounded-lg border transition ${
                  caps
                    ? 'bg-red-700 text-white border-red-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <ChevronUp className="w-5 h-5" />
                MAYÚS
              </button>
              {row3.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="flex-1 h-12 max-w-[64px] bg-slate-800 hover:bg-red-800 active:bg-red-700 text-lg font-bold rounded-lg border border-slate-700 active:scale-95 transition shadow"
                >
                  {caps ? key.toUpperCase() : key}
                </button>
              ))}
              <button
                type="button"
                onClick={onBackspace}
                className="px-4 h-12 flex items-center justify-center bg-slate-800 hover:bg-red-900/60 active:bg-red-800 text-red-200 border border-slate-700 rounded-lg transition"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Row 4 space & actions */}
            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleKey(' ')}
                className="flex-grow max-w-lg h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Space className="w-4 h-4" />
                ESPACIO
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 h-12 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg border border-emerald-500 transition shadow"
              >
                LISTO
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1 max-w-2xl mx-auto">
            <div className="flex justify-center gap-2">
              {numRow1.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="flex-1 h-14 bg-slate-800 hover:bg-red-800 active:bg-red-700 text-xl font-bold rounded-lg border border-slate-700 active:scale-95 transition shadow"
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {numRow2.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="flex-1 h-14 bg-slate-800 hover:bg-red-800 active:bg-red-700 text-xl font-bold rounded-lg border border-slate-700 active:scale-95 transition shadow"
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onBackspace}
                className="flex-1 h-12 bg-slate-800 hover:bg-red-900 text-red-200 border border-slate-700 font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <Delete className="w-5 h-5" />
                BORRAR
              </button>
              <button
                type="button"
                onClick={() => handleKey(' ')}
                className="flex-2 h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg"
              >
                ESPACIO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
