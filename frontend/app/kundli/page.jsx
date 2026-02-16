"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import KundliForm from '../../components/KundliForm';
import KundliMatching from '../../components/KundliMatching';
import SectionHeading from '../../components/SectionHeading';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import VedicKundliDisplay from '../../components/VedicKundliDisplay';
import VedicJyotishEmbed from '../../components/VedicJyotishEmbed';
import { redirectToVedicJyotish } from '../../lib/vedicjyotish/vedicJyotishRedirect';
import AuthModal from '../../components/AuthModal';
import AIKundliAnalysis from '../../components/AIKundliAnalysis';
import GeneralRemedies from '../../components/GeneralRemedies';
import swapnaData from '../../lib/vedicjyotish/data/swapna-jyotish.json';
import { generateTraditionalKundliPDF } from '../../utils/TraditionalKundliPDF';
import { localizeDigits } from '../../utils/localization';

// Async component to handle BS to AD conversion
function AsyncKundliDisplay({ selectedKundli, onClose }) {
  const [transformedData, setTransformedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const convertAndSetData = async () => {
      try {
        let birthYear, birthMonth, birthDay;

        if (selectedKundli.date_system === 'BS') {
          console.log(`🔄 Converting BS ${selectedKundli.birth_year}-${selectedKundli.birth_month}-${selectedKundli.birth_day} to AD`);

          // Import and use the conversion library
          const { BSToAD } = await import('ad-bs-date-conversion');
          const bsDateString = `${selectedKundli.birth_year}-${selectedKundli.birth_month.toString().padStart(2, '0')}-${selectedKundli.birth_day.toString().padStart(2, '0')}`;
          const adDateString = BSToAD(bsDateString);
          const [adYear, adMonth, adDay] = adDateString.split('-').map(Number);

          birthYear = adYear;
          birthMonth = adMonth;
          birthDay = adDay;

          console.log(`✅ Converted to AD ${birthYear}-${birthMonth}-${birthDay}`);
        } else {
          birthYear = selectedKundli.birth_year;
          birthMonth = selectedKundli.birth_month;
          birthDay = selectedKundli.birth_day;
        }

        const data = {
          name: selectedKundli.name,
          birthYear: birthYear,
          birthMonth: birthMonth,
          birthDay: birthDay,
          birthHour: selectedKundli.time_system === 'PM' && selectedKundli.birth_hour !== 12
            ? selectedKundli.birth_hour + 12
            : selectedKundli.time_system === 'AM' && selectedKundli.birth_hour === 12
              ? 0
              : selectedKundli.birth_hour,
          birthMinute: selectedKundli.birth_minute,
          birthSecond: selectedKundli.birth_second,
          latitude: selectedKundli.birth_latitude || 27.7172,
          longitude: selectedKundli.birth_longitude || 85.3240,
          birthPlace: selectedKundli.birth_place,
          relation: selectedKundli.relation,
          dateSystem: selectedKundli.date_system,
          timeSystem: selectedKundli.time_system
        };

        console.log('🔍 Original selectedKundli data:', selectedKundli);
        console.log('🔍 Transformed birthData for ComprehensiveKundliDisplay:', data);

        setTransformedData(data);
      } catch (error) {
        console.error('❌ Conversion failed:', error);
        // Fallback to simple conversion
        const data = {
          name: selectedKundli.name,
          birthYear: selectedKundli.date_system === 'BS' ? selectedKundli.birth_year - 57 : selectedKundli.birth_year,
          birthMonth: selectedKundli.birth_month,
          birthDay: selectedKundli.birth_day,
          birthHour: selectedKundli.time_system === 'PM' && selectedKundli.birth_hour !== 12
            ? selectedKundli.birth_hour + 12
            : selectedKundli.time_system === 'AM' && selectedKundli.birth_hour === 12
              ? 0
              : selectedKundli.birth_hour,
          birthMinute: selectedKundli.birth_minute,
          birthSecond: selectedKundli.birth_second,
          latitude: selectedKundli.birth_latitude || 27.7172,
          longitude: selectedKundli.birth_longitude || 85.3240,
          birthPlace: selectedKundli.birth_place,
          relation: selectedKundli.relation,
          dateSystem: selectedKundli.date_system,
          timeSystem: selectedKundli.time_system
        };
        setTransformedData(data);
      } finally {
        setLoading(false);
      }
    };

    convertAndSetData();
  }, [selectedKundli]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Converting date...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!transformedData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-red-600">Failed to convert date</div>
        </div>
      </div>
    );
  }

  return (
    <VedicKundliDisplay
      birthData={transformedData}
      kundli={selectedKundli}
      onClose={onClose}
    />
  );
}

export default function KundliPage() {
  const { language, t } = useLanguage();
  const { currentTheme } = useTheme();
  const [activeService, setActiveService] = useState('create');
  const [showKundliForm, setShowKundliForm] = useState(false);
  const [user, setUser] = useState(null);
  const [kundliList, setKundliList] = useState([]);
  const [selectedKundli, setSelectedKundli] = useState(null);
  const [showVedicJyotishEmbed, setShowVedicJyotishEmbed] = useState(false);
  const [vedicJyotishData, setVedicJyotishData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [kundliToDelete, setKundliToDelete] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [activeAIKundli, setActiveAIKundli] = useState(null);
  const [initialAITab, setInitialAITab] = useState(null);
  const [editingKundli, setEditingKundli] = useState(null);
  const [dreamSearch, setDreamSearch] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  const audioRef = useRef(null);

  // Fetch user and Kundli data
  // Fetch user and Kundli data with robust Auth listener
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          fetchKundliData(session.user.id);
          fetchUserPreferences(session.user.id);
        } else {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          fetchKundliData(session.user.id);
          fetchUserPreferences(session.user.id);
        } else {
          setUser(null);
          setKundliList([]);
          setUserPreferences(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserPreferences = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_user_preferences', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error fetching user preferences:', error);
      } else if (data && data.length > 0) {
        setUserPreferences(data[0]);
      } else {
        // Fallback for new users
        setUserPreferences({ membership: 'free' });
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
    }
  };

  const fetchKundliData = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kundli_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Kundli data:', error);
      } else {
        setKundliList(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh Kundli list
  const refreshKundliList = async () => {
    if (!user) return;
    await fetchKundliData(user.id);
  };

  // Format date for display
  const formatDate = (year, month, day, dateSystem) => {
    const y = localizeDigits(year, language);
    const m = localizeDigits(month.toString().padStart(2, '0'), language);
    const d = localizeDigits(day.toString().padStart(2, '0'), language);

    if (dateSystem === 'BS') {
      return `BS ${y}-${m}-${d}`;
    } else {
      return `${y}-${m}-${d} ${t('ad')}`;
    }
  };

  // Format time for display
  const formatTime = (hour, minute, second, timeSystem) => {
    const h = parseInt(hour);
    const m = parseInt(minute);
    const s = parseInt(second);
    const systemLabel = timeSystem === 'PM' ? t('pm') : t('am');

    const hh = localizeDigits(h.toString().padStart(2, '0'), language);
    const mm = localizeDigits(m.toString().padStart(2, '0'), language);
    const ss = localizeDigits(s.toString().padStart(2, '0'), language);

    if (timeSystem === 'PM' && h !== 12) {
      const h24 = localizeDigits((h + 12).toString().padStart(2, '0'), language);
      return `${h24}:${mm}:${ss} ${systemLabel}`;
    } else if (timeSystem === 'AM' && h === 12) {
      return `${localizeDigits("00", language)}:${mm}:${ss} ${systemLabel}`;
    } else {
      return `${hh}:${mm}:${ss} ${systemLabel}`;
    }
  };

  // Convert BS date to AD date using proper library
  const convertBSToAD = async (bsYear, bsMonth, bsDay) => {
    try {
      // Import the conversion library
      const { BSToAD } = await import('ad-bs-date-conversion');

      // Format BS date as string (YYYY-MM-DD)
      const bsDateString = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-${bsDay.toString().padStart(2, '0')}`;

      // Convert BS to AD
      const adDateString = BSToAD(bsDateString);

      // Parse the result
      const [adYear, adMonth, adDay] = adDateString.split('-').map(Number);

      return { year: adYear, month: adMonth, day: adDay };
    } catch (error) {
      console.error('BS to AD conversion error:', error);
      // Fallback to simple conversion
      return { year: bsYear - 57, month: bsMonth, day: bsDay };
    }
  };

  // Calculate age from birth date (simplified for display)
  const calculateAge = (year, month, day, dateSystem) => {
    try {
      let birthYear;

      if (dateSystem === 'BS') {
        // For age calculation, use simple year difference
        // The proper conversion will be handled in the data transformation
        birthYear = year - 57;
      } else {
        birthYear = year;
      }

      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    } catch (error) {
      return 'N/A';
    }
  };

  // Show delete confirmation modal
  const handleDeleteClick = (kundliId) => {
    setKundliToDelete(kundliId);
    setShowDeleteConfirm(true);
  };

  // Delete Kundli record
  const handleDelete = async () => {
    if (!kundliToDelete) return;

    try {
      const { error } = await supabase
        .from('kundli_data')
        .delete()
        .eq('id', kundliToDelete);

      if (error) {
        console.error('Error deleting Kundli:', error);
        setAlertMessage(`Failed to delete Kundli: ${error.message || 'Unknown error'} ${error.details || ''}`);
        setShowAlert(true);
      } else {
        // Remove from local state
        setKundliList(prev => prev.filter(k => k.id !== kundliToDelete));
        setShowDeleteConfirm(false);
        setKundliToDelete(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setAlertMessage('An error occurred while deleting');
      setShowAlert(true);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setKundliToDelete(null);
  };

  // Handle Traditional PDF Download
  const handleDownloadPDF = async (kundli, mode = 'download') => {
    // Validation: Check for mandatory advanced fields
    const missingFields = [];
    if (!kundli.fatherName && !kundli.father_name) missingFields.push("Father's Name");
    if (!kundli.motherName && !kundli.mother_name) missingFields.push("Mother's Name");
    if (!kundli.gotra && !kundli.Gotra) missingFields.push("Gotra");
    if (!kundli.nawranName && !kundli.nawran_name) missingFields.push("Nawran Name");

    if (missingFields.length > 0) {
      setAlertMessage(`To view or download the detailed PDF, please complete the **Advance Options** in the Edit section.`);
      setShowAlert(true);
      return;
    }

    try {
      let fullData = kundli;

      // If we have user email, try to fetch the full JSON data which has more details
      if (user?.email) {
        const response = await fetch(`/api/kundli-storage?name=${encodeURIComponent(kundli.name)}&email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const jsonData = await response.json();
          // Merge to ensure we have all fields from both sources
          fullData = { ...kundli, ...jsonData };
          console.log(`Using full JSON data for PDF (${mode} mode)`);
        }
      }

      await generateTraditionalKundliPDF(fullData, mode);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to generate PDF. Make sure you are logged in.");
    }
  };

  const services = [
    {
      id: 'create',
      title: t('kundli')
    },
    {
      id: 'matching',
      title: t('kundaliMatching')
    },
    {
      id: 'remedies',
      title: t('astrologicalRemedies')
    }
  ];

  const renderServiceContent = () => {
    switch (activeService) {
      case 'create':
        return (
          <KundliForm
            onSubmit={() => {
              refreshKundliList();
            }}
            onClose={() => setActiveService('list')}
          />
        );
      case 'matching':
        return <KundliMatching kundliList={kundliList} currentUser={user} />;
      case 'analysis':
        return (
          <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-8 text-center`}>
            {/* ... keeping existing content ... */}
            <div className="text-6xl mb-4">📊</div>
            <h3 className={`text-2xl font-bold ${currentTheme.colors.text} mb-4`}>Kundli Analysis</h3>
            {/* ... */}
          </div>
        );
      case 'remedies':
      case 'remedies':
        return <GeneralRemedies />;
      default:
        return <KundliForm />;
    }
  };

  // We need to keep renderServiceContent intact, but I'll focus on the Modal part
  // RENDER AREA
  return (
    <div className="min-h-screen pt-20 flex flex-col pb-48 md:pb-0">
      {/* ... Header and Services Grid ... */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow={t('featuresTitle')}
          />
        </div>
      </section>

      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  setActiveService(service.id);
                  setShowKundliForm(false);
                }}
                className={`cursor-pointer transition-all duration-300 ${activeService === service.id
                  ? `${currentTheme.colors.surface} border-2 ${currentTheme.colors.primary} border-opacity-50`
                  : `${currentTheme.colors.surface} border ${currentTheme.colors.border} hover:${currentTheme.colors.hover}`
                  } rounded-lg p-2 md:p-4 text-center flex items-center justify-center`}
              >
                <h3 className={`text-xs md:text-lg font-bold ${currentTheme.colors.text} leading-tight`}>
                  {service.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Kundali Content */}
      {activeService === 'create' && (
        <section className="py-8">
          {/* ... existing user check logic ... */}
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  if (user) {
                    setShowKundliForm(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t('createKundali')}
              </button>
            </div>

            {user && kundliList.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {kundliList.map((kundli) => (
                    // ... List Items ...
                    <div key={kundli.id} className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} hover:${currentTheme.colors.hover} rounded-lg p-3 cursor-pointer transition-all duration-300 relative group`}>

                      {/* PDF Buttons */}
                      {['monthly', 'yearly'].includes(userPreferences?.membership?.toLowerCase()) && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(kundli, 'download');
                            }}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Download Traditional PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(kundli, 'view');
                            }}
                            className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="View Traditional PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {/* ... Rest of card ... */}
                      <h3 className={`text-lg font-bold ${currentTheme.colors.text} mb-1`}>
                        {kundli.name}
                      </h3>
                      <p className={`text-xs ${currentTheme.colors.textSecondary} mb-2`}>
                        {kundli.relation === 'Self' ? t('self') : kundli.relation}
                      </p>
                      <div className="space-y-0.5 mb-3">
                        <div className={`text-xs ${currentTheme.colors.textSecondary}`}>
                          📅 {formatDate(kundli.birth_year, kundli.birth_month, kundli.birth_day, kundli.date_system)}
                        </div>
                        <div className={`text-xs ${currentTheme.colors.textSecondary}`}>
                          🕐 {formatTime(kundli.birth_hour, kundli.birth_minute, kundli.birth_second || 0, kundli.time_system)}
                        </div>
                        <div className={`text-xs ${currentTheme.colors.textSecondary}`}>
                          📍 {kundli.birth_place}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setActiveAIKundli(kundli); setShowAIAnalysis(true); }} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          {t('analysis')}
                        </button>
                        <button onClick={() => { setEditingKundli(kundli); setShowKundliForm(true); }} className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          {t('edit')}
                        </button>
                        <button onClick={() => handleDeleteClick(kundli.id)} className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full h-32 md:hidden"></div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Conditionally render form and other services */}
      {showKundliForm && user && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <KundliForm
              initialData={editingKundli}
              onClose={() => { setShowKundliForm(false); setEditingKundli(null); refreshKundliList(); }}
              onSubmit={() => refreshKundliList()}
            />
          </div>
        </section>
      )}

      {activeService && activeService !== 'create' && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            {renderServiceContent()}
          </div>
        </section>
      )}

      {selectedKundli && <AsyncKundliDisplay selectedKundli={selectedKundli} onClose={() => setSelectedKundli(null)} />}

      {showAIAnalysis && activeAIKundli && (
        <AIKundliAnalysis
          selectedKundli={activeAIKundli}
          userEmail={user?.email}
          userPreferences={userPreferences}
          initialTab={initialAITab || 'overview'}
          onClose={() => {
            setShowAIAnalysis(false);
            setActiveAIKundli(null);
            setInitialAITab(null);
          }}
        />
      )}

      {showVedicJyotishEmbed && vedicJyotishData && (
        <VedicJyotishEmbed birthData={vedicJyotishData} onClose={() => { setShowVedicJyotishEmbed(false); setVedicJyotishData(null); }} />
      )}

      {/* Premium Dark Theme Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-red-500/20">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('deleteKundliHeading')}</h3>
              <p className="text-gray-400 text-sm">
                {t('deleteKundliConfirm')}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCancelDelete} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                {t('cancel')}
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20 transition-all">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Dark Theme Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('missingDetails')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {alertMessage}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowAlert(false)}
                className="w-full px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all"
              >
                {t('okayIllAddIt')}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <div className="h-48 md:hidden text-transparent select-none">Spacer</div>
      <Footer />
    </div>
  );

}
