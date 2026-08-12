import React, { FormEvent, useState } from 'react';
import { LockKeyhole, X } from 'lucide-react';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'MARCO2026';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setError('');
      onSuccess();
      return;
    }

    setPassword('');
    setError('Contraseña incorrecta. Inténtalo nuevamente.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-800 text-white">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Acceso al panel admin</h2>
            <p className="mt-1 text-sm text-slate-400">Ingresa la contraseña para gestionar el catálogo.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="admin-password">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={event => {
              setPassword(event.target.value);
              setError('');
            }}
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
            placeholder="Escribe la contraseña"
          />
          {error && <p className="text-sm font-medium text-red-300" role="alert">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-red-800 px-4 py-3 font-bold text-white transition hover:bg-red-700">
            INGRESAR AL PANEL
          </button>
        </form>
      </div>
    </div>
  );
};