import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Category, Brochure, Lead, KioskSettings, Specialist } from './types';
import {
  getKioskSettings,
  saveKioskSettings,
  getStoredLeads,
  saveLead,
  recordBrochureView,
  recordNewSession,
  getStoredCategories,
  getStoredBrochures,
  saveCategories,
  saveBrochures
} from './utils/storage';

import { TotemFrameContainer } from './components/TotemFrameContainer';
import { TotemHeader } from './components/TotemHeader';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { PdfViewerModal } from './components/PdfViewerModal';

import { AttractionScreen } from './views/AttractionScreen';
import { HomeCategoriesView } from './views/HomeCategoriesView';
import { CategoryDetailView } from './views/CategoryDetailView';
import { BrochureLibraryView } from './views/BrochureLibraryView';
import { LeadFormView } from './views/LeadFormView';
import { NotFoundRouteView } from './views/NotFoundRouteView';
import { SpecialistRouteView } from './views/SpecialistRouteView';
import { ConfirmationView } from './views/ConfirmationView';
import { AdminPanelModal } from './views/AdminPanelModal';

type ViewState =
  | 'attraction'
  | 'categories'
  | 'category_detail'
  | 'brochures_library'
  | 'lead_form'
  | 'route_not_found'
  | 'route_specialist'
  | 'confirmation';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('attraction');
  const [categories, setCategories] = useState<Category[]>(getStoredCategories());
  const [brochures, setBrochures] = useState<Brochure[]>(getStoredBrochures());
  const [leads, setLeads] = useState<Lead[]>(getStoredLeads());
  const [settings, setSettings] = useState<KioskSettings>(getKioskSettings());

  // Navigation Context State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrochure, setSelectedBrochure] = useState<Brochure | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [requirementType, setRequirementType] = useState<string>('');
  const [requirementDetail, setRequirementDetail] = useState<string>('');
  const [leadSource, setLeadSource] = useState<'Brochure' | 'No Encontró' | 'Especialista Directo' | 'Biblioteca'>('Brochure');
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  // Modals & Keyboard
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [activePdfBrochure, setActivePdfBrochure] = useState<Brochure | null>(null);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [virtualKeyboardVisible, setVirtualKeyboardVisible] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Idle Timeout Countdown Logic
  const [idleTimeRemaining, setIdleTimeRemaining] = useState<number>(settings.idleTimeoutSeconds);
  const lastActivityRef = useRef<number>(Date.now());

  const resetToAttraction = useCallback(() => {
    setViewState('attraction');
    setSelectedCategory(null);
    setSelectedBrochure(null);
    setSelectedSpecialist(null);
    setShowPdfModal(false);
    setVirtualKeyboardVisible(false);
  }, []);

  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleTimeRemaining(settings.idleTimeoutSeconds);
  }, [settings.idleTimeoutSeconds]);

  // Idle reset interval timer
  useEffect(() => {
    if (viewState === 'attraction' || settings.idleTimeoutSeconds <= 0) return;

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, settings.idleTimeoutSeconds - elapsedSeconds);
      setIdleTimeRemaining(remaining);

      if (remaining <= 0) {
        resetToAttraction();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState, settings.idleTimeoutSeconds, resetToAttraction]);

  // Global activity listener for touch screen
  useEffect(() => {
    const events = ['touchstart', 'pointerdown', 'click', 'keydown'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [handleUserActivity]);

  // Handle start from attraction screen
  const handleStartAttraction = () => {
    recordNewSession();
    handleUserActivity();
    setViewState('categories');
  };

  // Select Category
  const handleSelectCategory = (cat: Category) => {
    handleUserActivity();
    setSelectedCategory(cat);
    setViewState('category_detail');
  };

  // Open PDF Reader
  const handleOpenBrochure = (brochure: Brochure) => {
    handleUserActivity();
    recordBrochureView();
    setActivePdfBrochure(brochure);
    setShowPdfModal(true);
  };

  // Handle Send Brochure to Email from PDF viewer
  const handleSendBrochureFromPdf = (brochure: Brochure) => {
    handleUserActivity();
    setShowPdfModal(false);
    setSelectedBrochure(brochure);
    setLeadSource('Brochure');
    setViewState('lead_form');
  };

  // Handle Request Specialist from PDF viewer
  const handleRequestAdviceFromPdf = (brochure: Brochure) => {
    handleUserActivity();
    setShowPdfModal(false);
    setSelectedBrochure(brochure);
    setLeadSource('Brochure');
    setViewState('lead_form');
  };

  // Handle Lead Submission
  const handleSubmitLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => {
    handleUserActivity();
    const newLead = saveLead(leadData);
    setLeads(getStoredLeads());
    setSubmittedLead(newLead);
    setVirtualKeyboardVisible(false);
    setViewState('confirmation');
  };

  // Virtual keyboard key handlers
  const handleVirtualKeyPress = (char: string) => {
    handleUserActivity();
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart || 0;
      const end = activeEl.selectionEnd || 0;
      const val = activeEl.value;
      const newVal = val.substring(0, start) + char + val.substring(end);
      activeEl.value = newVal;

      // Dispatch input event for React state sync
      const event = new Event('input', { bubbles: true });
      activeEl.dispatchEvent(event);

      activeEl.setSelectionRange(start + 1, start + 1);
    }
  };

  const handleVirtualBackspace = () => {
    handleUserActivity();
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart || 0;
      const end = activeEl.selectionEnd || 0;
      const val = activeEl.value;
      if (start > 0 || start !== end) {
        const deletePos = start === end ? start - 1 : start;
        const newVal = val.substring(0, deletePos) + val.substring(end);
        activeEl.value = newVal;

        const event = new Event('input', { bubbles: true });
        activeEl.dispatchEvent(event);

        activeEl.setSelectionRange(deletePos, deletePos);
      }
    }
  };

  const handleInputFocus = (fieldKey: string) => {
    setFocusedInput(fieldKey);
    if (settings.enableVirtualKeyboard) {
      setVirtualKeyboardVisible(true);
    }
  };

  const updateSettingsHandler = (newPartial: Partial<KioskSettings>) => {
    const updated = saveKioskSettings(newPartial);
    setSettings(updated);
  };

  return (
    <TotemFrameContainer
      settings={settings}
      onUpdateSettings={updateSettingsHandler}
      onOpenAdmin={() => setShowAdminModal(true)}
      onResetSession={resetToAttraction}
    >
      {/* Attraction Screen (Idle) */}
      {viewState === 'attraction' ? (
        <AttractionScreen
          onStart={handleStartAttraction}
          companyName={settings.companyName}
          eventTitle={settings.eventTitle}
        />
      ) : (
        <div className="flex-1 flex flex-col justify-between h-full bg-marco-bg text-brand-800 overflow-hidden relative">
          {/* Kiosk Header Bar */}
          <TotemHeader
            title={
              viewState === 'categories' ? 'Selección de Soluciones' :
              viewState === 'category_detail' ? selectedCategory?.title || 'Detalle' :
              viewState === 'brochures_library' ? `Brochures ${selectedCategory?.title || ''}` :
              viewState === 'lead_form' ? 'Formulario de Contacto' :
              viewState === 'route_not_found' ? 'Atención Personalizada' :
              viewState === 'route_specialist' ? 'Asignación de Especialista' :
              'Confirmación'
            }
            subtitle={selectedCategory?.subtitle}
            showBack={viewState !== 'categories' && viewState !== 'confirmation'}
            onBack={() => {
              handleUserActivity();
              if (viewState === 'category_detail') setViewState('categories');
              else if (viewState === 'brochures_library') setViewState('category_detail');
              else if (viewState === 'lead_form') setViewState('categories');
              else if (viewState === 'route_not_found') setViewState('categories');
              else if (viewState === 'route_specialist') setViewState('categories');
              else setViewState('categories');
            }}
            onHome={resetToAttraction}
            onOpenAdmin={() => setShowAdminModal(true)}
            idleTimeRemaining={idleTimeRemaining}
          />

          {/* Main View Router Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {viewState === 'categories' && (
              <HomeCategoriesView
                categories={categories}
                onSelectCategory={handleSelectCategory}
                onNotFoundRoute={() => {
                  handleUserActivity();
                  setViewState('route_not_found');
                }}
                onSpecialistRoute={() => {
                  handleUserActivity();
                  setViewState('route_specialist');
                }}
              />
            )}

            {viewState === 'category_detail' && selectedCategory && (
              <CategoryDetailView
                category={selectedCategory}
                brochures={brochures}
                onViewBrochures={() => {
                  handleUserActivity();
                  setViewState('brochures_library');
                }}
                onRequestAdvice={() => {
                  handleUserActivity();
                  setLeadSource('Brochure');
                  setViewState('lead_form');
                }}
                onOpenSingleBrochure={(b) => handleOpenBrochure(b)}
              />
            )}

            {viewState === 'brochures_library' && selectedCategory && (
              <BrochureLibraryView
                category={selectedCategory}
                brochures={brochures}
                onOpenBrochure={handleOpenBrochure}
                onSendAllToEmail={() => {
                  handleUserActivity();
                  setLeadSource('Biblioteca');
                  setViewState('lead_form');
                }}
              />
            )}

            {viewState === 'lead_form' && (
              <LeadFormView
                category={selectedCategory || undefined}
                brochure={selectedBrochure || undefined}
                requirementType={requirementType}
                requirementDetail={requirementDetail}
                specialistArea={selectedSpecialist?.title}
                source={leadSource}
                onSubmitLead={handleSubmitLead}
                onActiveInputFocus={handleInputFocus}
              />
            )}

            {viewState === 'route_not_found' && (
              <NotFoundRouteView
                onContinue={(reqType, detail) => {
                  handleUserActivity();
                  setRequirementType(reqType);
                  setRequirementDetail(detail);
                  setLeadSource('No Encontró');
                  setViewState('lead_form');
                }}
                onActiveInputFocus={handleInputFocus}
              />
            )}

            {viewState === 'route_specialist' && (
              <SpecialistRouteView
                onSelectSpecialist={(spec) => {
                  handleUserActivity();
                  setSelectedSpecialist(spec);
                  setLeadSource('Especialista Directo');
                  setViewState('lead_form');
                }}
              />
            )}

            {viewState === 'confirmation' && (
              <ConfirmationView
                lead={submittedLead}
                onExploreMore={() => {
                  handleUserActivity();
                  setViewState('categories');
                }}
                onFinish={resetToAttraction}
                autoResetSeconds={settings.autoResetConfirmationSeconds}
              />
            )}
          </div>

          {/* Touch Virtual Keyboard Overlay */}
          <VirtualKeyboard
            visible={virtualKeyboardVisible}
            onKeyPress={handleVirtualKeyPress}
            onBackspace={handleVirtualBackspace}
            onClose={() => setVirtualKeyboardVisible(false)}
          />
        </div>
      )}

      {/* PDF Interactive Viewer Modal */}
      {showPdfModal && activePdfBrochure && (
        <PdfViewerModal
          brochure={activePdfBrochure}
          category={categories.find(c => c.id === activePdfBrochure.categoryId)}
          onClose={() => setShowPdfModal(false)}
          onSendToEmail={handleSendBrochureFromPdf}
          onRequestSpecialist={handleRequestAdviceFromPdf}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanelModal
          leads={leads}
          categories={categories}
          brochures={brochures}
          settings={settings}
          onClose={() => setShowAdminModal(false)}
          onRefreshLeads={() => setLeads(getStoredLeads())}
          onCatalogChange={(nextCategories, nextBrochures) => {
            saveCategories(nextCategories);
            saveBrochures(nextBrochures);
            setCategories(nextCategories);
            setBrochures(nextBrochures);
          }}
          onUpdateSettings={updateSettingsHandler}
        />
      )}
    </TotemFrameContainer>
  );
}
