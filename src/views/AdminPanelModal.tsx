import React, { useState } from 'react';
import { Lead, KioskSettings, Category, Brochure } from '../types';
import {
  exportLeadsToXLSX,
  updateLeadStatus,
  getAdminStats,
  saveKioskSettings
} from '../utils/storage';
import {
  FileSpreadsheet,
  X,
  Database,
  Users,
  Eye,
  TrendingUp,
  Settings,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  Keyboard,
  Smartphone
} from 'lucide-react';

interface AdminPanelModalProps {
  leads: Lead[];
  categories: Category[];
  brochures: Brochure[];
  settings: KioskSettings;
  onClose: () => void;
  onRefreshLeads: () => void;
  onUpdateSettings: (newSettings: Partial<KioskSettings>) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  leads,
  categories,
  brochures,
  settings,
  onClose,
  onRefreshLeads,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'content' | 'settings'>('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const stats = getAdminStats();

  const handleExport = () => {
    exportLeadsToXLSX();
  };

  const handleStatusChange = (leadId: string, status: 'Nuevo' | 'Asignado' | 'Contactado') => {
    updateLeadStatus(leadId, status);
    onRefreshLeads();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-800 text-white flex items-center justify-center font-extrabold text-xl">
              M
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Panel MARCO Explorer</h2>
              <p className="text-xs text-slate-400">Gestión de leads, contenidos y configuración del tótem</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Export XLSX Button (Wireframe Page 12) */}
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-sm rounded-xl border border-red-600 transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>EXPORTAR XLSX</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Key Metrics Header Bar (Wireframe Page 12 top metrics) */}
        <div className="grid grid-cols-3 gap-3 p-6 bg-slate-900 border-b border-slate-800">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center">
            <div className="text-3xl font-black text-white">{stats.totalLeads}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Leads Registrados</div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center">
            <div className="text-3xl font-black text-emerald-400">{stats.conversionRate}%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Conversión</div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center">
            <div className="text-3xl font-black text-sky-400">{stats.totalBrochuresViewed}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Brochures Vistos</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Últimos Registros ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'content'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Gestión de Contenidos</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes del Tótem</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">Leads Capturados en Local Storage</h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  Base de Datos Local Offline OK
                </span>
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/80 shadow-lg">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/90 text-xs uppercase font-bold text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Nombre</th>
                      <th className="p-3.5">Empresa</th>
                      <th className="p-3.5">Interés</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5 font-bold text-white">
                          <div>{lead.fullName}</div>
                          <div className="text-xs text-slate-500 font-normal">{lead.email}</div>
                        </td>
                        <td className="p-3.5 text-slate-200">{lead.company}</td>
                        <td className="p-3.5 text-xs text-red-300 font-medium">
                          {lead.categoryName || 'General'}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                              lead.status === 'Nuevo'
                                ? 'bg-red-950 text-red-200 border-red-700'
                                : lead.status === 'Asignado'
                                ? 'bg-amber-950 text-amber-200 border-amber-700'
                                : 'bg-emerald-950 text-emerald-200 border-emerald-700'
                            }`}
                          >
                            <option value="Nuevo">Nuevo</option>
                            <option value="Asignado">Asignado</option>
                            <option value="Contactado">Contactado</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 font-medium text-slate-200"
                          >
                            Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Gestión de Contenidos (Wireframe Page 12)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Agregar o reemplazar brochure</span>
                    <Plus className="w-5 h-5 text-red-400" />
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sube archivos PDF actualizados para que estén disponibles offline en la feria.
                  </p>
                  <button className="w-full mt-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs">
                    Subir Nuevo Documento PDF
                  </button>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Editar categoría y descripción</span>
                    <Edit2 className="w-5 h-5 text-red-400" />
                  </h4>
                  <p className="text-xs text-slate-400">
                    Modifica los textos descriptivos y aplicaciones de cada una de las 6 líneas.
                  </p>
                  <button className="w-full mt-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs">
                    Editar Categorías
                  </button>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Asignar responsable comercial</span>
                    <Users className="w-5 h-5 text-red-400" />
                  </h4>
                  <p className="text-xs text-slate-400">
                    Asigna correos y teléfonos de especialistas para notificación interna.
                  </p>
                  <button className="w-full mt-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs">
                    Configurar Especialistas
                  </button>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Activar / Desactivar contenido</span>
                    <CheckCircle className="w-5 h-5 text-red-400" />
                  </h4>
                  <p className="text-xs text-slate-400">
                    Oculta o muestra soluciones en tiempo real durante la feria.
                  </p>
                  <button className="w-full mt-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs">
                    Gestionar Visibilidad
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Ajustes del Tótem y Kiosco</h3>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
                {/* Idle Timer Setting */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      Reinicio automático por inactividad
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tiempo de inactividad antes de regresar a la pantalla de atracción (PDF Wireframe 30-45s)
                    </p>
                  </div>
                  <select
                    value={settings.idleTimeoutSeconds}
                    onChange={(e) => onUpdateSettings({ idleTimeoutSeconds: Number(e.target.value) })}
                    className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-bold text-white outline-none"
                  >
                    <option value={30}>30 segundos</option>
                    <option value={35}>35 segundos (Recomendado)</option>
                    <option value={45}>45 segundos</option>
                    <option value={60}>60 segundos</option>
                    <option value={0}>Desactivado</option>
                  </select>
                </div>

                {/* Virtual Keyboard Toggle */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Keyboard className="w-4 h-4 text-red-400" />
                      Teclado Táctil Virtual en Pantalla
                    </h4>
                    <p className="text-xs text-slate-400">
                      Muestra teclado en pantalla al enfocar campos en pantalla táctil de 55"
                    </p>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ enableVirtualKeyboard: !settings.enableVirtualKeyboard })}
                    className={`px-4 py-2 font-bold text-xs rounded-xl border transition ${
                      settings.enableVirtualKeyboard
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {settings.enableVirtualKeyboard ? 'Activado' : 'Desactivado'}
                  </button>
                </div>

                {/* Frame Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-red-400" />
                      Simulador de Marco Físico Tótem 1080x1920
                    </h4>
                    <p className="text-xs text-slate-400">
                      Visualiza el marco exterior del tótem LCD de 55" en la previsualización
                    </p>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ totemFrameMode: !settings.totemFrameMode })}
                    className={`px-4 py-2 font-bold text-xs rounded-xl border transition ${
                      settings.totemFrameMode
                        ? 'bg-red-950 text-red-300 border-red-600'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {settings.totemFrameMode ? 'Marco Activo' : 'Pantalla Completa'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">MARCO Explorer · Expomina 2026 Kiosk Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition"
          >
            Cerrar Panel
          </button>
        </div>
      </div>

      {/* Selected Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4 text-slate-200">
            <h4 className="text-lg font-bold text-white">Detalles del Lead</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Nombre:</strong> {selectedLead.fullName}</p>
              <p><strong>Empresa:</strong> {selectedLead.company}</p>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Teléfono:</strong> {selectedLead.phone || 'No especificado'}</p>
              <p><strong>Cargo:</strong> {selectedLead.position || 'No especificado'}</p>
              <p><strong>Interés:</strong> {selectedLead.categoryName || 'General'}</p>
              <p><strong>Brochure:</strong> {selectedLead.brochureTitle || 'N/A'}</p>
              {selectedLead.requirementDetail && (
                <p><strong>Requerimiento:</strong> {selectedLead.requirementDetail}</p>
              )}
              <p><strong>Origen:</strong> {selectedLead.source}</p>
              <p><strong>Fecha:</strong> {new Date(selectedLead.createdAt).toLocaleString('es-PE')}</p>
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              className="w-full py-2 bg-red-800 text-white font-bold rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
