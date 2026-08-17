import React, { useState } from 'react';
import { Category, Brochure, Lead } from '../types';
import { Send, CheckSquare, Square, Building2, User, Mail, Phone, Briefcase, Info } from 'lucide-react';

interface LeadFormViewProps {
  category?: Category;
  brochure?: Brochure;
  requirementType?: string;
  requirementDetail?: string;
  specialistArea?: string;
  source?: 'Brochure' | 'No Encontró' | 'Especialista Directo' | 'Biblioteca';
  onSubmitLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => void;
  onActiveInputFocus?: (fieldKey: string) => void;
}

export const LeadFormView: React.FC<LeadFormViewProps> = ({
  category,
  brochure,
  requirementType,
  requirementDetail,
  specialistArea,
  source = 'Brochure',
  onSubmitLead,
  onActiveInputFocus
}) => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [authorizedTerms, setAuthorizedTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const detectedInterestText = [
    category?.title,
    brochure?.title,
    specialistArea,
    requirementType
  ].filter(Boolean).join(' · ') || 'Soluciones MARCO Explorer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y apellido.');
      return;
    }
    if (!company.trim()) {
      setErrorMsg('Por favor ingresa el nombre de tu empresa.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo corporativo válido.');
      return;
    }

    setErrorMsg('');
    onSubmitLead({
      fullName: fullName.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      categoryId: category?.id,
      categoryName: category?.title,
      brochureId: brochure?.id,
      brochureTitle: brochure?.title,
      requirementType,
      requirementDetail,
      specialistArea,
      authorizedTerms,
      source
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 bg-marco-bg text-brand-800 overflow-y-auto">
      {/* Title */}
      <div className="space-y-1 text-left">
        <h2 className="text-3xl font-black text-brand-700 tracking-tight">
          Déjanos tus datos
        </h2>
        <p className="text-sm text-brand-500 font-medium">
          Te enviaremos el brochure y un especialista podrá contactarte.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-brand-700/90 border border-accent-600 rounded-xl text-white text-sm font-bold animate-shake">
          {errorMsg}
        </div>
      )}

      {/* Touch Form Controls */}
      <form onSubmit={handleSubmit} className="space-y-4 my-auto">
        {/* Nombre y apellido */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
            <User className="w-4 h-4 text-accent-600" />
            Nombre y apellido *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onFocus={() => onActiveInputFocus?.('fullName')}
            placeholder="Ej. Carlos Mendoza"
            className="w-full h-14 px-4 bg-white border-2 border-marco-border focus:border-accent-500 rounded-xl text-brand-800 font-medium text-base placeholder-brand-300 outline-none transition"
          />
        </div>

        {/* Empresa */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-accent-600" />
            Empresa *
          </label>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onFocus={() => onActiveInputFocus?.('company')}
            placeholder="Ej. Compañía Minera Andina"
            className="w-full h-14 px-4 bg-white border-2 border-marco-border focus:border-accent-500 rounded-xl text-brand-800 font-medium text-base placeholder-brand-300 outline-none transition"
          />
        </div>

        {/* Correo corporativo */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-accent-600" />
            Correo corporativo *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => onActiveInputFocus?.('email')}
            placeholder="nombre@empresa.com"
            className="w-full h-14 px-4 bg-white border-2 border-marco-border focus:border-accent-500 rounded-xl text-brand-800 font-medium text-base placeholder-brand-300 outline-none transition"
          />
        </div>

        {/* Teléfono / WhatsApp */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-accent-600" />
            Teléfono / WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onFocus={() => onActiveInputFocus?.('phone')}
            placeholder="+51 999 999 999"
            className="w-full h-14 px-4 bg-white border-2 border-marco-border focus:border-accent-500 rounded-xl text-brand-800 font-medium text-base placeholder-brand-300 outline-none transition"
          />
        </div>

        {/* Cargo */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-accent-600" />
            Cargo
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            onFocus={() => onActiveInputFocus?.('position')}
            placeholder="Ej. Jefe de Mantenimiento / Superintendente"
            className="w-full h-14 px-4 bg-white border-2 border-marco-border focus:border-accent-500 rounded-xl text-brand-800 font-medium text-base placeholder-brand-300 outline-none transition"
          />
        </div>

        {/* Interés Detectado (Wireframe Page 8) */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Interés detectado</span>
          <div className="p-3.5 bg-brand-100 border border-brand-200 rounded-xl text-xs font-bold text-brand-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-accent-600 shrink-0" />
            <span className="line-clamp-2">{detectedInterestText}</span>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div
          onClick={() => setAuthorizedTerms(!authorizedTerms)}
          className="flex items-center gap-3 pt-2 cursor-pointer select-none"
        >
          {authorizedTerms ? (
            <CheckSquare className="w-6 h-6 text-accent-600 shrink-0" />
          ) : (
            <Square className="w-6 h-6 text-brand-300 shrink-0" />
          )}
          <span className="text-xs text-brand-500 font-medium">
            Autorizo el tratamiento de mis datos para fines comerciales y de contacto MARCO.
          </span>
        </div>

        {/* Submit CTA Button (Height > 80px) */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-5 px-6 min-h-[76px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-extrabold text-xl tracking-wider rounded-xl border border-accent-300 flex items-center justify-center gap-3 transition shadow-xl touch-cta"
          >
            <Send className="w-6 h-6 text-white" />
            <span>ENVIAR SOLICITUD</span>
          </button>
        </div>
      </form>
    </div>
  );
};
