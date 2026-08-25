import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Category, Brochure, Lead, KioskSettings, Specialist } from './types';
import {
  initStorage,
  getKioskSettings as getStoredSettings,
  saveKioskSettings as saveKioskSettingsRaw,
  getStoredLeads,
  saveLead,
  recordBrochureView as incrementBrochureViews,
  recordNewSession as incrementSessions,
  getStoredCategories,
  getStoredBrochures,
  getStoredSpecialists,
  saveCategories,
  saveBrochures,
  storageEvents
} from './utils/storage';
import { TotemFrameContainer } from './components/TotemFrameContainer';
import { TotemHeader } from './components/TotemHeader';
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
import { AdminAuthModal } from './components/AdminAuthModal';

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
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('attraction');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<KioskSettings>(getStoredSettings());

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
  const [showAdminAuth, setShowAdminAuth] = useState<boolean>(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  

  // Idle Timeout Countdown Logic
  const [idleTimeRemaining, setIdleTimeRemaining] = useState<number>(settings.idleTimeoutSeconds);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    initStorage()
      .then(() => {
        setCategories(getStoredCategories());
        setBrochures(getStoredBrochures());
        setSpecialists(getStoredSpecialists());
        setLeads(getStoredLeads());
        setSettings(getStoredSettings());
        setStorageReady(true);
      })
      .catch((err: Error) => {
        setStorageError(err.message || 'No se pudo cargar totem-marco');
      });
  }, []);

  // Listen to storage events so UI updates automatically when DB changes
  useEffect(() => {
    const onLeads = () => setLeads(getStoredLeads());
    const onCats = () => setCategories(getStoredCategories());
    const onBros = () => setBrochures(getStoredBrochures());
    const onSpecs = () => setSpecialists(getStoredSpecialists());
    const onSettings = () => setSettings(getStoredSettings());
    const onReady = () => {
      setCategories(getStoredCategories());
      setBrochures(getStoredBrochures());
      setSpecialists(getStoredSpecialists());
      setLeads(getStoredLeads());
      setSettings(getStoredSettings());
      setStorageReady(true);
    };

    storageEvents.addEventListener('leadsChanged', onLeads);
    storageEvents.addEventListener('categoriesChanged', onCats);
    storageEvents.addEventListener('brochuresChanged', onBros);
    storageEvents.addEventListener('specialistsChanged', onSpecs);
    storageEvents.addEventListener('settingsChanged', onSettings);
    storageEvents.addEventListener('storageReady', onReady);

    return () => {
      storageEvents.removeEventListener('leadsChanged', onLeads);
      storageEvents.removeEventListener('categoriesChanged', onCats);
      storageEvents.removeEventListener('brochuresChanged', onBros);
      storageEvents.removeEventListener('specialistsChanged', onSpecs);
      storageEvents.removeEventListener('settingsChanged', onSettings);
      storageEvents.removeEventListener('storageReady', onReady);
    };
  }, []);

  const resetToAttraction = useCallback(() => {
    setViewState('attraction');
    setSelectedCategory(null);
    setSelectedBrochure(null);
    setSelectedSpecialist(null);
    setShowPdfModal(false);
  }, []);

  // Refs para el timer — nada de esto causa re-renders ni recrea el intervalo
  const idleTimeoutRef    = useRef<number>(settings.idleTimeoutSeconds);
  const viewStateRef      = useRef<string>('attraction');
  const resetAttractionRef = useRef(resetToAttraction);
  const showAdminModalRef = useRef<boolean>(false);
  const showAdminAuthRef  = useRef<boolean>(false);

  // Mantener refs sincronizados sin recrear el timer
  useEffect(() => { idleTimeoutRef.current = settings.idleTimeoutSeconds; }, [settings.idleTimeoutSeconds]);
  useEffect(() => { viewStateRef.current = viewState; }, [viewState]);
  useEffect(() => { resetAttractionRef.current = resetToAttraction; }, [resetToAttraction]);
  useEffect(() => { showAdminModalRef.current = showAdminModal; }, [showAdminModal]);
  useEffect(() => { showAdminAuthRef.current = showAdminAuth; }, [showAdminAuth]);

  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleTimeRemaining(idleTimeoutRef.current);
  }, []);

  // Timer único — se crea UNA SOLA VEZ al montar, nunca se recrea
  useEffect(() => {
    const timer = setInterval(() => {
      // Ignorar si estamos en pantalla de atracción, modal admin abierto o timeout desactivado
      if (viewStateRef.current === 'attraction' || showAdminModalRef.current || showAdminAuthRef.current) return;
      const timeout = idleTimeoutRef.current;
      if (timeout <= 0) return;

      const elapsed   = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeout - elapsed);
      setIdleTimeRemaining(remaining);

      if (remaining <= 0) {
        resetAttractionRef.current();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []); // ← array vacío: solo se monta/desmonta con el componente

  // Global activity listener for touch screen
  useEffect(() => {
    const events = ['touchstart', 'pointerdown', 'click', 'keydown', 'input', 'pointermove'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [handleUserActivity]);

  // Handle start from attraction screen
  const handleStartAttraction = async () => {
    try {
      incrementSessions();
    } catch (err) {
      console.error('Error incrementando sesiones:', err);
    }
    lastActivityRef.current = Date.now(); // resetear ANTES de cambiar vista
    setIdleTimeRemaining(idleTimeoutRef.current);
    setViewState('categories');
  };

  // Select Category
  const handleSelectCategory = (cat: Category) => {
    handleUserActivity();
    setSelectedCategory(cat);
    setViewState('category_detail');
  };

  // Open PDF Reader
  const handleOpenBrochure = async (brochure: Brochure) => {
    handleUserActivity();
    try {
      incrementBrochureViews();
    } catch (err) {
      console.error('Error incrementando vistas de brochure:', err);
    }
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
  const handleSubmitLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => {
    handleUserActivity();
    try {
      const newLead = saveLead(leadData);
      setLeads(getStoredLeads());
      setSubmittedLead(newLead);
      setViewState('confirmation');
    } catch (err) {
      console.error('Error guardando lead:', err);
      alert('Error al guardar el formulario. Intenta nuevamente.');
    }
  };

  // Virtual keyboard removed: input focus handling not required
  const handleInputFocus = (_fieldKey: string) => {};

  const updateSettingsHandler = async (newPartial: Partial<KioskSettings>) => {
    try {
      const { settings: updated, saved } = saveKioskSettingsRaw(newPartial);
      setSettings(updated);
      return saved;
    } catch (err) {
      console.error('Error guardando configuración:', err);
      return false;
    }
  };

  const openAdmin = () => {
    if (adminAuthenticated) {
      setShowAdminModal(true);
      return;
    }
    setShowAdminAuth(true);
  };

  const closeAdmin = () => {
    setShowAdminModal(false);
    setAdminAuthenticated(false);
  };

  if (!storageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-marco-bg text-brand-800 p-8">
        <div className="text-center space-y-3 max-w-md">
          {storageError ? (
            <>
              <p className="text-xl font-bold text-red-700">Error cargando totem-marco</p>
              <p className="text-sm text-brand-500">{storageError}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold">Cargando totem-marco...</p>
              <p className="text-sm text-brand-500">Sincronizando catálogo, leads y configuración.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <TotemFrameContainer
      settings={settings}
      onUpdateSettings={updateSettingsHandler}
      onOpenAdmin={openAdmin}
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
            onOpenAdmin={openAdmin}
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
              />
            )}

            {viewState === 'route_specialist' && (
              <SpecialistRouteView
                specialists={specialists}
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

          {/* Virtual keyboard removed for offline touch-only mode */}
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
      {showAdminAuth && (
        <AdminAuthModal
          onClose={() => setShowAdminAuth(false)}
          onSuccess={() => {
            setShowAdminAuth(false);
            setAdminAuthenticated(true);
            setShowAdminModal(true);
          }}
        />
      )}

      {showAdminModal && (
        <AdminPanelModal
          leads={leads}
          categories={categories}
          brochures={brochures}
          settings={settings}
          onClose={closeAdmin}
          onRefreshLeads={() => setLeads(getStoredLeads())}
          onCatalogChange={async (nextCategories, nextBrochures) => {
            const [catOk, broOk] = await Promise.all([
              saveCategories(nextCategories),
              saveBrochures(nextBrochures),
            ]);
            // Los storageEvents ya actualizan el estado via listeners
            // Solo forzamos update si hubo éxito
            if (catOk) setCategories(getStoredCategories());
            if (broOk) setBrochures(getStoredBrochures());
            return catOk && broOk;
          }}
          onUpdateSettings={updateSettingsHandler}
        />
      )}
      <SpeedInsights />
    </TotemFrameContainer>
  );
}
