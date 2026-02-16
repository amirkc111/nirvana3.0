"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import KundliForm from './KundliForm';
import ComprehensiveKundliDisplay from './ComprehensiveKundliDisplay';

export default function KundliDashboard() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [kundliList, setKundliList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedKundli, setSelectedKundli] = useState(null);
  const [user, setUser] = useState(null);

  // Get current user and fetch Kundli data
  useEffect(() => {
    const fetchUserAndKundli = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError(t('pleaseLoginViewKundli'));
          return;
        }

        setUser(user);

        // Fetch user's Kundli data
        const { data: kundliData, error: kundliError } = await supabase
          .from('kundli_data')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (kundliError) {
          console.error('Error fetching Kundli data:', kundliError);
          setError('Failed to load Kundli data');
        } else {
          setKundliList(kundliData || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndKundli();
  }, []);

  // Delete Kundli record
  const handleDelete = async (kundliId) => {
    if (!confirm(t('deleteKundliConfirm'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('kundli_data')
        .delete()
        .eq('id', kundliId);

      if (error) {
        console.error('Error deleting Kundli:', error);
        alert(`Failed to delete Kundli: ${error.message || 'Unknown error'} ${error.details || ''}`);
      } else {
        // Remove from local state
        setKundliList(prev => prev.filter(k => k.id !== kundliId));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while deleting');
    }
  };

  // Format date for display
  const formatDate = (year, month, day, dateSystem) => {
    if (dateSystem === 'BS') {
      return `BS ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${t('ad')}`;
    }
  };

  // Format time for display
  const formatTime = (hour, minute, second, timeSystem) => {
    const h = parseInt(hour);
    const m = parseInt(minute);
    const s = parseInt(second);

    if (timeSystem === 'PM' && h !== 12) {
      return `${h + 12}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${t('pm')}`;
    } else if (timeSystem === 'AM' && h === 12) {
      return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${t('am')}`;
    } else {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${t(timeSystem.toLowerCase())}`;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.colors.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${currentTheme.colors.textSecondary} text-lg`}>{t('loadingKundliData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${currentTheme.colors.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className={`${currentTheme.colors.textPrimary} text-lg font-semibold mb-2`}>Error</h3>
          <p className={`${currentTheme.colors.textSecondary} text-sm mb-4`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <KundliForm
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          setShowAddForm(false);
          // Refresh the list
          window.location.reload();
        }}
      />
    );
  }

  if (selectedKundli) {
    return (
      <ComprehensiveKundliDisplay
        birthData={selectedKundli}
        onClose={() => setSelectedKundli(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.colors.background}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`${currentTheme.colors.textPrimary} text-3xl font-bold mb-2`}>
            {t('janmaKundaliPageTitle')}
          </h1>
          <p className={`${currentTheme.colors.textSecondary} text-lg`}>
            {t('yourBirthCharts')}
          </p>
        </div>

        {/* Add Kundli Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('addKundaliPlus')}
          </button>
        </div>

        {/* All Janma Kundali */}
        <div className="mb-6">
          <h2 className={`${currentTheme.colors.textPrimary} text-xl font-semibold mb-4`}>
            {t('allJanmaKundali')}
          </h2>

          {kundliList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`${currentTheme.colors.textPrimary} text-lg font-semibold mb-2`}>
                {t('noKundaliFound')}
              </h3>
              <p className={`${currentTheme.colors.textSecondary} text-sm mb-4`}>
                {t('noKundaliFoundDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {kundliList.map((kundli) => (
                <div key={kundli.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  {/* User Profile */}
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-black font-semibold">{kundli.name}</h3>
                      <p className="text-gray-500 text-sm">{kundli.relation}</p>
                    </div>
                  </div>

                  {/* Birth Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-black text-sm">
                        {formatDate(kundli.birth_year, kundli.birth_month, kundli.birth_day, kundli.date_system)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-black text-sm">
                        {formatTime(kundli.birth_hour, kundli.birth_minute, kundli.birth_second, kundli.time_system)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-black text-sm">{kundli.birth_place}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedKundli(kundli)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t('view')}
                    </button>

                    <button
                      onClick={() => handleDelete(kundli.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
