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
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-marco-bg text-brand-800 overflow-y-auto select-none p-6 md:p-8 lg:p-10">
      <div className="w-full h-full flex flex-col justify-between max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2 text-left shrink-0">
          <h2 className="text-3xl md:text-5xl font-black text-brand-700 tracking-tight">
            Déjanos tus datos
          </h2>
          <p className="text-base md:text-xl text-brand-500 font-medium">
            Te enviaremos la información técnica y un especialista MARCO podrá contactarte.
          </p>
        </div>

        {errorMsg && (
          <div className="p-5 bg-red-600 border border-red-500 rounded-2xl text-white text-base font-bold shadow-lg animate-shake shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Touch Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4 my-auto">
          {/* Nombre y apellido */}
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <User className="w-5 h-5 text-accent-600" />
              Nombre y apellido *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={() => onActiveInputFocus?.('fullName')}
              placeholder="Ej. Carlos Mendoza"
              className="w-full h-16 px-5 bg-white border-2 border-marco-border focus:border-accent-500 rounded-2xl text-brand-800 font-bold text-lg sm:text-xl placeholder-brand-300 outline-none transition shadow-sm"
            />
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent-600" />
              Empresa *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onFocus={() => onActiveInputFocus?.('company')}
              placeholder="Ej. Compañía Minera Andina"
              className="w-full h-16 px-5 bg-white border-2 border-marco-border focus:border-accent-500 rounded-2xl text-brand-800 font-bold text-lg sm:text-xl placeholder-brand-300 outline-none transition shadow-sm"
            />
          </div>

          {/* Correo corporativo */}
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent-600" />
              Correo corporativo *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => onActiveInputFocus?.('email')}
              placeholder="nombre@empresa.com"
              className="w-full h-16 px-5 bg-white border-2 border-marco-border focus:border-accent-500 rounded-2xl text-brand-800 font-bold text-lg sm:text-xl placeholder-brand-300 outline-none transition shadow-sm"
            />
          </div>

          {/* Teléfono / WhatsApp */}
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <Phone className="w-5 h-5 text-accent-600" />
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => onActiveInputFocus?.('phone')}
              placeholder="+51 999 999 999"
              className="w-full h-16 px-5 bg-white border-2 border-marco-border focus:border-accent-500 rounded-2xl text-brand-800 font-bold text-lg sm:text-xl placeholder-brand-300 outline-none transition shadow-sm"
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent-600" />
              Cargo en la empresa
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              onFocus={() => onActiveInputFocus?.('position')}
              placeholder="Ej. Superintendente de Mantenimiento / Operaciones"
              className="w-full h-16 px-5 bg-white border-2 border-marco-border focus:border-accent-500 rounded-2xl text-brand-800 font-bold text-lg sm:text-xl placeholder-brand-300 outline-none transition shadow-sm"
            />
          </div>

          {/* Interés Detectado */}
          <div className="space-y-2 pt-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-500">Interés detectado</span>
            <div className="p-4 bg-brand-100 border border-brand-200 rounded-2xl text-sm sm:text-base font-bold text-brand-700 flex items-center gap-3">
              <Info className="w-5 h-5 text-accent-600 shrink-0" />
              <span className="line-clamp-2">{detectedInterestText}</span>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div
            onClick={() => setAuthorizedTerms(!authorizedTerms)}
            className="flex items-start sm:items-center gap-3.5 pt-2 cursor-pointer select-none"
          >
            {authorizedTerms ? (
              <CheckSquare className="w-7 h-7 text-accent-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <Square className="w-7 h-7 text-brand-300 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <span className="text-xs sm:text-sm text-brand-600 font-bold leading-snug">
              Autorizo el tratamiento de mis datos para fines comerciales y contacto técnico de MARCO.
            </span>
          </div>

          {/* Submit CTA Button (Height > 88px) */}
          <div className="pt-4 shrink-0">
            <button
              type="submit"
              className="w-full py-5 px-8 min-h-[88px] lg:min-h-[96px] bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white font-black text-2xl tracking-wider rounded-2xl border-2 border-accent-300 flex items-center justify-center gap-4 transition shadow-2xl touch-cta"
            >
              <Send className="w-7 h-7 text-white" />
              <span>ENVIAR SOLICITUD</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
