import React, { useState } from 'react';
import { Lead, KioskSettings, Category, Brochure } from '../types';
import {
  exportLeadsToXLSX as exportLeadsToExcel,
  updateLeadStatus,
  getAdminStats,
  saveKioskSettings,
} from '../utils/storage';
import { resetDb } from '../utils/db';
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
  Smartphone,
  Upload,
  Save
} from 'lucide-react';

interface AdminPanelModalProps {
  leads: Lead[];
  categories: Category[];
  brochures: Brochure[];
  settings: KioskSettings;
  onClose: () => void;
  onRefreshLeads: () => void;
  onCatalogChange: (categories: Category[], brochures: Brochure[]) => Promise<boolean>;
  onUpdateSettings: (newSettings: Partial<KioskSettings>) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  leads,
  categories,
  brochures,
  settings,
  onClose,
  onRefreshLeads,
  onCatalogChange,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'content' | 'settings'>('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrochure, setEditingBrochure] = useState<Brochure | null>(null);
  const [contentError, setContentError] = useState('');
  const [panelMessage, setPanelMessage] = useState<string | null>(null);

  const showPanelMessage = (msg: string) => {
    setPanelMessage(msg);
    setTimeout(() => setPanelMessage(null), 3000);
  };

  const stats = getAdminStats();

  const handleExport = () => {
    try {
      exportLeadsToExcel();
    } catch (err) {
      console.error('Error exportando leads:', err);
      showPanelMessage('No se pudo exportar los leads. Intenta nuevamente.');
    }
  };

  const handleExportSqlite = () => {
    try {
      const a = document.createElement('a');
      a.href = 'http://localhost:3001/api/export';
      a.download = 'totem-marco.sqlite';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error exportando sqlite:', err);
      showPanelMessage('No se pudo exportar la base de datos');
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm(
      '¿Resetear la base de datos al estado original?\n\nEsto borrará todos los cambios guardados (categorías, brochures editados, leads) y recargará desde el archivo base.\n\nEsta acción no se puede deshacer.'
    )) return;
    try {
      // 1. Borrar snapshot de IndexedDB → fuerza recargar desde public/totem-marco
      await resetDb();

      // 2. Limpiar caches del navegador
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }

      // 3. Recargar
      window.location.reload();
    } catch (err) {
      console.error('Error reseteando DB:', err);
      alert('No se pudo resetear la base de datos. Revisa la consola.');
    }
  };

  const handleStatusChange = (leadId: string, status: 'Nuevo' | 'Asignado' | 'Contactado') => {
    try {
      updateLeadStatus(leadId, status);
      onRefreshLeads();
      showPanelMessage('Estado actualizado correctamente');
    } catch (err) {
      console.error('Error actualizando estado del lead:', err);
      showPanelMessage('Error al actualizar el estado. Intenta nuevamente.');
    }
  };

  const emptyCategory = (): Category => ({
    id: `category-${Date.now()}`, code: '', title: '', subtitle: '', color: '#991b1b',
    bgLight: '#fff7f7', bannerTitle: '', bannerDescription: '', applications: [''], brochureCount: 0, iconName: 'BookOpen'
  });

  const emptyBrochure = (): Brochure => ({
    id: `brochure-${Date.now()}`, categoryId: categories[0]?.id || '', title: '', pages: 1,
    yearOrType: 'PDF · Español', fileSize: '', description: '', pageImages: []
  });

  const updateCategoryField = (field: keyof Category, value: string | number | string[]) => {
    setEditingCategory(current => current ? { ...current, [field]: value } : current);
  };

  const updateBrochureField = (field: keyof Brochure, value: string | number | string[]) => {
    setEditingBrochure(current => current ? { ...current, [field]: value } : current);
  };

  const handlePdfUpload = (file?: File) => {
    if (!file || !editingBrochure) return;
    if (file.type !== 'application/pdf') {
      setContentError('Selecciona un archivo PDF válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateBrochureField('pdfUrl', String(reader.result));
      updateBrochureField('fileSize', `${(file.size / 1024 / 1024).toFixed(1)} MB`);
      setContentError('');
    };
    reader.onerror = () => setContentError('No se pudo leer el PDF.');
    reader.readAsDataURL(file);
  };

  const saveCategoryForm = async () => {
    if (!editingCategory?.title.trim()) return setContentError('La categoría necesita un nombre.');
    const next = categories.some(item => item.id === editingCategory.id)
      ? categories.map(item => item.id === editingCategory.id ? editingCategory : item)
      : [...categories, editingCategory];
    const saved = await onCatalogChange(next, brochures);
    setEditingCategory(null);
    setContentError('');
    if (saved) {
      showPanelMessage('Guardado correctamente');
    } else {
      showPanelMessage('No se pudo guardar. Revisa la base de datos.');
    }
  };

  const saveBrochureForm = async () => {
    if (!editingBrochure?.title.trim() || !editingBrochure.categoryId) {
      return setContentError('El brochure necesita nombre y categoría.');
    }
    const next = brochures.some(item => item.id === editingBrochure.id)
      ? brochures.map(item => item.id === editingBrochure.id ? editingBrochure : item)
      : [...brochures, editingBrochure];
    const saved = await onCatalogChange(categories, next);
    setEditingBrochure(null);
    setContentError('');
    if (saved) {
      showPanelMessage('Guardado correctamente');
    } else {
      showPanelMessage('No se pudo guardar. Revisa la base de datos.');
    }
  };

  const removeCategory = async (id: string) => {
    if (!window.confirm('¿Borrar esta categoría y sus brochures?')) return;
    await onCatalogChange(
      categories.filter(item => item.id !== id),
      brochures.filter(item => item.categoryId !== id)
    );
    showPanelMessage('Categoría eliminada');
  };

  const removeBrochure = async (id: string) => {
    if (!window.confirm('¿Borrar este brochure?')) return;
    await onCatalogChange(categories, brochures.filter(item => item.id !== id));
    showPanelMessage('Brochure eliminado');
  };

  const panelInputClass = 'w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200">
      <div className="bg-slate-900 border-b border-slate-700 w-full h-full flex flex-col overflow-hidden text-slate-100">
        {/* Admin Header */}
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
              onClick={handleExportSqlite}
              title="Descargar base de datos SQLite"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-xl border border-slate-600 transition shadow"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>EXPORTAR .SQLITE</span>
            </button>

            <button
              type="button"
              onClick={handleClearCache}
              title="Resetear DB al estado original"
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-red-900 text-white font-bold text-sm rounded-xl border border-slate-600 hover:border-red-700 transition"
            >
              <RefreshCw className="w-4 h-4 text-sky-300" />
              <span>RESETEAR DB</span>
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
        {panelMessage && (
          <div className="mx-6 mt-4 rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-100 shadow-lg shadow-amber-950/20">
            {panelMessage}
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">Leads Capturados en totem-marco</h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  Base de Datos totem-marco OK
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
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg text-white">Catálogo offline</h3>
                  <p className="text-xs text-slate-400">Los cambios y los PDF se guardan en este dispositivo.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditingCategory(emptyCategory()); setContentError(''); }} className="inline-flex items-center gap-2 px-3 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-bold">
                    <Plus className="w-4 h-4" /> Nueva categoría
                  </button>
                  <button type="button" onClick={() => { setEditingBrochure(emptyBrochure()); setContentError(''); }} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold">
                    <Upload className="w-4 h-4" /> Nuevo PDF
                  </button>
                </div>
              </div>

              {contentError && <p className="rounded-lg border border-red-700 bg-red-950/60 px-3 py-2 text-sm text-red-200">{contentError}</p>}

              {editingCategory && (
                <div className="rounded-2xl border border-red-700/80 bg-slate-900/90 p-5 shadow-lg shadow-red-950/20">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-red-700/60 bg-red-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-200">
                        Categoría
                      </span>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {categories.some(item => item.id === editingCategory.id) ? 'Editar categoría' : 'Nueva categoría'}
                      </h4>
                    </div>
                    <span className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                      {categories.some(item => item.id === editingCategory.id) ? 'Editar' : 'Crear'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Nombre</span>
                      <input value={editingCategory.title} onChange={e => updateCategoryField('title', e.target.value)} placeholder="Nombre de categoría" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Código</span>
                      <input value={editingCategory.code} onChange={e => updateCategoryField('code', e.target.value)} placeholder="Código" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Subtítulo</span>
                      <input value={editingCategory.subtitle} onChange={e => updateCategoryField('subtitle', e.target.value)} placeholder="Subtítulo" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Título del banner</span>
                      <input value={editingCategory.bannerTitle} onChange={e => updateCategoryField('bannerTitle', e.target.value)} placeholder="Título del banner" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Descripción</span>
                      <textarea value={editingCategory.bannerDescription} onChange={e => updateCategoryField('bannerDescription', e.target.value)} placeholder="Descripción" className={`${panelInputClass} min-h-24 resize-y`} />
                    </label>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold text-white transition">Cancelar</button>
                    <button type="button" onClick={saveCategoryForm} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition"><Save className="w-4 h-4" /> Guardar</button>
                  </div>
                </div>
              )}

              {editingBrochure && (
                <div className="rounded-2xl border border-cyan-700/80 bg-slate-900/90 p-5 shadow-lg shadow-cyan-950/20">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-cyan-700/60 bg-cyan-950/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
                        Brochure / PDF
                      </span>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {brochures.some(item => item.id === editingBrochure.id) ? 'Editar brochure' : 'Nuevo brochure'}
                      </h4>
                    </div>
                    <span className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                      {brochures.some(item => item.id === editingBrochure.id) ? 'Editar' : 'Crear'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Título</span>
                      <input value={editingBrochure.title} onChange={e => updateBrochureField('title', e.target.value)} placeholder="Título del PDF" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Categoría</span>
                      <select value={editingBrochure.categoryId} onChange={e => updateBrochureField('categoryId', e.target.value)} className={panelInputClass}>
                        <option value="">Selecciona categoría</option>
                        {categories.map(category => <option key={category.id} value={category.id}>{category.title}</option>)}
                      </select>
                    </label>

                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Páginas</span>
                      <input type="number" min="1" value={editingBrochure.pages} onChange={e => updateBrochureField('pages', Number(e.target.value))} placeholder="Páginas" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Tipo o año</span>
                      <input value={editingBrochure.yearOrType} onChange={e => updateBrochureField('yearOrType', e.target.value)} placeholder="Tipo o año" className={panelInputClass} />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Descripción</span>
                      <textarea value={editingBrochure.description} onChange={e => updateBrochureField('description', e.target.value)} placeholder="Descripción" className={`${panelInputClass} min-h-24 resize-y`} />
                    </label>

                    <label className="md:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-950/60 px-3 py-3 text-sm text-slate-300 transition hover:border-cyan-500 hover:bg-slate-950">
                      <Upload className="w-5 h-5 text-cyan-400" />
                      <span>{editingBrochure.pdfUrl ? `PDF cargado (${editingBrochure.fileSize || 'tamaño desconocido'})` : 'Seleccionar archivo PDF'}</span>
                      <input type="file" accept="application/pdf,.pdf" onChange={e => handlePdfUpload(e.target.files?.[0])} className="hidden" />
                    </label>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setEditingBrochure(null)} className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold text-white transition">Cancelar</button>
                    <button type="button" onClick={saveBrochureForm} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition"><Save className="w-4 h-4" /> Guardar PDF</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <section className="rounded-xl border border-slate-700 bg-slate-800/70 overflow-hidden"><div className="px-4 py-3 border-b border-slate-700 flex justify-between"><h4 className="font-bold">Categorías ({categories.length})</h4><span className="text-xs text-slate-400">Editar o borrar</span></div>{categories.map(category => <div key={category.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/70"><div><p className="font-bold text-white">{category.title}</p><p className="text-xs text-slate-400">{category.code} · {brochures.filter(item => item.categoryId === category.id).length} PDF</p></div><div className="flex gap-1"><button type="button" title="Editar categoría" onClick={() => setEditingCategory({ ...category })} className="p-2 rounded-lg hover:bg-slate-700 text-slate-300"><Edit2 className="w-4 h-4" /></button><button type="button" title="Borrar categoría" onClick={() => removeCategory(category.id)} className="p-2 rounded-lg hover:bg-red-950 text-red-300"><Trash2 className="w-4 h-4" /></button></div></div>)}</section>
                <section className="rounded-xl border border-slate-700 bg-slate-800/70 overflow-hidden"><div className="px-4 py-3 border-b border-slate-700 flex justify-between"><h4 className="font-bold">Brochures / PDF ({brochures.length})</h4><span className="text-xs text-slate-400">Editar o borrar</span></div>{brochures.map(brochure => <div key={brochure.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/70"><div className="min-w-0"><p className="font-bold text-white truncate">{brochure.title}</p><p className="text-xs text-slate-400 truncate">{categories.find(item => item.id === brochure.categoryId)?.title || 'Sin categoría'} · {brochure.pdfUrl ? 'PDF cargado' : 'Sin PDF'}</p></div><div className="flex gap-1"><button type="button" title="Editar brochure" onClick={() => setEditingBrochure({ ...brochure })} className="p-2 rounded-lg hover:bg-slate-700 text-slate-300"><Edit2 className="w-4 h-4" /></button><button type="button" title="Borrar brochure" onClick={() => removeBrochure(brochure.id)} className="p-2 rounded-lg hover:bg-red-950 text-red-300"><Trash2 className="w-4 h-4" /></button></div></div>)}</section>
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

                {/* Virtual keyboard removed from settings for kiosk.
                    The feature is disabled by default and no longer configurable from UI. */}

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
