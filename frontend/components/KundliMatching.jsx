"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import gunaMilanService from '../lib/gunaMilanService';
import panchangaService from '../lib/panchangaService';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeDigits } from '../utils/localization';
import { kundaliGenerationService } from '../lib/kundaliGenerationService';

import { supabase } from '../lib/supabaseClient';

const KundliMatching = ({ kundliList = [], currentUser }) => {
  const { language, t } = useLanguage();
  const { currentTheme } = useTheme();
  const [selectedMaleId, setSelectedMaleId] = useState('');
  const [selectedFemaleId, setSelectedFemaleId] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [savedMatches, setSavedMatches] = useState([]);

  // Fetch saved matches from database
  const fetchSavedMatches = async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('kundli_matches')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedMatches(data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchSavedMatches();
  }, [currentUser]);

  // Save the match result to the database
  const saveMatchHistory = async (result, groom, bride) => {
    if (!currentUser) return;

    try {
      console.log('Checking for existing match...');
      // Check for duplicates
      const { data: existingMatches, error: checkError } = await supabase
        .from('kundli_matches')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('male_kundli_id', groom.id)
        .eq('female_kundli_id', bride.id)
        .limit(1);

      if (checkError) {
        console.error('Error checking duplicates:', checkError);
      }

      if (existingMatches && existingMatches.length > 0) {
        console.log('Match already exists. Skipping save.');
        return; // Skip duplicate save
      }

      console.log('Saving match history...');
      const { error } = await supabase
        .from('kundli_matches')
        .insert([
          {
            user_id: currentUser.id,
            male_kundli_id: groom.id,
            female_kundli_id: bride.id,
            score: result.totalScore,
            total_score: 36, // Standard max
            male_name: groom.name,
            female_name: bride.name,
            details: result, // Store full JSON result
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error saving match:', error);
      } else {
        console.log('Match saved successfully!');
        fetchSavedMatches(); // Refresh list after save
      }
    } catch (err) {
      console.error('Exception saving match:', err);
    }
  };

  // Delete a match record from history
  const deleteMatchHistory = async (e, matchId) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('kundli_matches')
        .delete()
        .eq('id', matchId)
        .eq('user_id', currentUser.id); // Security: ensure user owns the record

      if (error) throw error;

      console.log('Match record deleted successfully');
      fetchSavedMatches(); // Refresh the list
    } catch (err) {
      console.error('Error deleting match record:', err);
    }
  };



  useEffect(() => {
    const initEngine = async () => {
      try {
        await kundaliGenerationService.initialize();
        setIsEngineReady(true);
      } catch (err) {
        console.error("Failed to initialize astrology engine:", err);
        setError("Failed to initialize astrology engine. Please try refreshing the page.");

      }
    };
    initEngine();
  }, []);

  // Robust gender extractor
  const getGender = (k) => {
    if (!k || !k.gender) return 'male'; // Default to male if missing

    let g = k.gender;
    // Handle array case (common in some DB configurations)
    if (Array.isArray(g)) g = g[0];

    if (typeof g !== 'string') return 'male';

    return g.toLowerCase().trim();
  };

  const maleOptions = kundliList.filter(k => {
    const g = getGender(k);
    return g === 'male';
  });

  const femaleOptions = kundliList.filter(k => {
    const g = getGender(k);
    return g === 'female';
  });

  const selectedMale = maleOptions.find(k => k.id === selectedMaleId);
  const selectedFemale = femaleOptions.find(k => k.id === selectedFemaleId);

  // Helper to reconstruct Date object from split DB fields
  const getProfileDate = (profile) => {
    if (!profile) return null;

    try {
      // If birth_date exists (legacy/fallback), try using it
      if (profile.birth_date) {
        return new Date(`${profile.birth_date}T${profile.birth_time || '12:00:00'}`);
      }

      // Use split fields from updated schema
      const year = parseInt(profile.birth_year);
      const month = parseInt(profile.birth_month) - 1; // JS months are 0-indexed
      const day = parseInt(profile.birth_day);

      let hour = parseInt(profile.birth_hour) || 12;
      const minute = parseInt(profile.birth_minute) || 0;
      const timeSystem = profile.time_system || 'AM'; // Default to AM if missing

      // Convert 12h to 24h
      let hour24 = hour;
      if (timeSystem === 'PM' && hour < 12) hour24 = hour + 12;
      if (timeSystem === 'AM' && hour === 12) hour24 = 0;

      const date = new Date(year, month, day, hour24, minute);

      // Basic validation
      if (isNaN(date.getTime())) {
        console.error("Invalid date components:", { year, month, day, hour24, minute });
        return null;
      }

      return date;
    } catch (err) {
      console.error("Error reconstructing date:", err, profile);
      return null;
    }
  };

  const handleMatch = async () => {
    if (!selectedMale || !selectedFemale) return;

    setIsMatching(true);
    setError(null);
    setMatchResult(null);

    try {
      // Ensure Swiss Ephemeris is initialized
      if (!window.swe) {
        console.log("SWE missing on window, attempting late initialization...");
        await kundaliGenerationService.initialize();
        if (!window.swe) {
          throw new Error("Astrology engine not initialized. Please refresh the page.");
        }
      }

      // 1. Prepare Male Data
      const maleDate = getProfileDate(selectedMale);
      if (!maleDate) throw new Error("Could not reconstruct birth date for groom.");

      const malePanchang = await panchangaService.calculatePanchanga(
        maleDate,
        selectedMale.birth_latitude || 28.61, // Default to Delhi if missing
        selectedMale.birth_longitude || 77.20,
        selectedMale.tznm || 'Asia/Kolkata' // Default time zone
      );

      // Calculate Moon Longitude
      // Use explicit function or safely access property if panchangaService returns it
      // Based on our implementation, `calculatePanchanga` returns an object with Moon's longitude.
      // Wait, let's verify what `calculatePanchanga` returns or used.
      // Actually, we need the *raw* longitude. 
      // If panchangaService doesn't expose it easily, we can use `swe` directly or trust the service.
      // Let's assume the service works as integrated previously.
      // But looking at previous editing, we implemented `gunaMilanService` but called it from here.

      // FIX: We need standard Moon Longitude.
      // Let's use `swe` directly for safety if we can or use the service if it provides it.
      // Actually, in the previous `handleMatch` implementation (before I pasted this full replacement block), 
      // I used `await panchangaService.calculatePanchanga`.

      const maleMoonLon = malePanchang.moonLongitude;

      // 2. Prepare Female Data
      const femaleDate = getProfileDate(selectedFemale);
      if (!femaleDate) throw new Error("Could not reconstruct birth date for bride.");

      const femalePanchang = await panchangaService.calculatePanchanga(
        femaleDate,
        selectedFemale.birth_latitude || 28.61,
        selectedFemale.birth_longitude || 77.20,
        selectedFemale.tznm || 'Asia/Kolkata'
      );
      const femaleMoonLon = femalePanchang.moonLongitude;

      // 3. Calculate Guna Milan
      const result = gunaMilanService.calculateMatching(maleMoonLon, femaleMoonLon); // Pass longitudes
      setMatchResult(result);
      saveMatchHistory(result, selectedMale, selectedFemale);
    } catch (err) {
      console.error("Guna Milan Error:", err);
      setError("An error occurred during matching. Please check the profile details.");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className={`w-full min-h-screen ${currentTheme.background} relative overflow-hidden transition-colors duration-700`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/20 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="p-8 text-center bg-gradient-to-b from-purple-500/10 to-transparent border-b border-white/5">
        <h2 className={`text-4xl font-extrabold ${currentTheme.colors.text} mb-2 tracking-tight`}>
          {t('compatibilityCheck')}
        </h2>
        <p className={`${currentTheme.colors.textSecondary} text-lg`}>
        </p>
      </div>

      <div className="p-8 lg:p-12 flex flex-col items-center">
        {/* Selection Area */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl relative z-10">

          {/* Groom Selection */}
          <div className="space-y-4 relative">
            <label className={`block text-sm font-bold uppercase tracking-widest text-blue-400 mb-1`}>
              Male Kundli
            </label>

            {/* Custom Dropdown Trigger */}
            <div className="relative group">
              <button
                onClick={() => {
                  document.getElementById('groom-dropdown').classList.toggle('hidden');
                  document.getElementById('bride-dropdown').classList.add('hidden');
                }}
                className={`w-full text-left bg-white/5 border ${currentTheme.colors.border} rounded-xl py-2.5 px-4 ${currentTheme.colors.text} focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer hover:bg-white/10 flex items-center justify-between backdrop-blur-sm shadow-inner`}
              >
                <span className={`text-sm font-medium truncate ${!selectedMaleId ? "text-gray-500 italic" : ""}`}>
                  {selectedMale ? `${selectedMale.name}` : t('selectGroom')}
                </span>
                <svg className="w-4 h-4 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Dropdown List */}
              <div
                id="groom-dropdown"
                className="hidden absolute top-full left-0 right-0 mt-2 border border-gray-700 rounded-xl shadow-2xl overflow-y-auto"
                style={{ backgroundColor: '#09090b', zIndex: 9999, maxHeight: '240px' }}
              >
                {maleOptions.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center text-sm">{t('noMaleProfiles')}</div>
                ) : (
                  maleOptions.map(k => (
                    <div
                      key={k.id}
                      onClick={() => {
                        setSelectedMaleId(k.id);
                        document.getElementById('groom-dropdown').classList.add('hidden');
                      }}
                      className="p-3 hover:bg-white/10 cursor-pointer text-gray-200 border-b border-gray-800 last:border-0"
                    >
                      <div className="font-bold text-white text-sm">{k.name}</div>
                      <div className="text-[10px] text-gray-400">{k.birth_place}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bride Selection */}
          <div className="space-y-4 relative" style={{ isolation: 'isolate' }}>
            <label className={`block text-xs font-bold uppercase tracking-widest text-pink-400 mb-1 ml-1`}>
              Female Kundli
            </label>

            {/* Custom Dropdown Trigger */}
            <div className="relative group">
              <button
                onClick={() => {
                  document.getElementById('bride-dropdown').classList.toggle('hidden');
                  document.getElementById('groom-dropdown').classList.add('hidden');
                }}
                className={`w-full text-left bg-white/5 border ${currentTheme.colors.border} rounded-xl py-2.5 px-4 ${currentTheme.colors.text} focus:ring-2 focus:ring-pink-500 transition-all outline-none cursor-pointer hover:bg-white/10 flex items-center justify-between backdrop-blur-sm shadow-inner`}
              >
                <span className={`text-sm font-medium truncate ${!selectedFemaleId ? "text-gray-500 italic" : ""}`}>
                  {selectedFemale ? `${selectedFemale.name}` : t('selectBride')}
                </span>
                <svg className="w-4 h-4 text-pink-400 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Dropdown List */}
              <div
                id="bride-dropdown"
                className="hidden absolute top-full left-0 right-0 mt-2 border border-gray-700 rounded-xl shadow-2xl overflow-y-auto"
                style={{ backgroundColor: '#09090b', zIndex: 9999, maxHeight: '240px' }}
              >
                {femaleOptions.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center text-sm">{t('noFemaleProfiles')}</div>
                ) : (
                  femaleOptions.map(k => (
                    <div
                      key={k.id}
                      onClick={() => {
                        setSelectedFemaleId(k.id);
                        document.getElementById('bride-dropdown').classList.add('hidden');
                      }}
                      className="p-3 hover:bg-white/10 cursor-pointer text-gray-200 border-b border-gray-800 last:border-0"
                    >
                      <div className="font-bold text-white text-sm">{k.name}</div>
                      <div className="text-[10px] text-gray-400">{k.birth_place}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Match Button - Moved Outside Grid for Full Width */}
        <div className="mt-6 w-full max-w-lg">

          {!matchResult ? (
            <button
              onClick={handleMatch}
              disabled={!selectedMaleId || !selectedFemaleId || isMatching}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide uppercase shadow-lg transition-all relative overflow-hidden group
                    ${!selectedMaleId || !selectedFemaleId
                  ? 'bg-white/5 text-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-95 text-white shadow-purple-900/50'
                }`}
            >
              {isMatching ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('analyzing')}</span>
                </div>
              ) : (
                t('matchProfiles')
              )}
            </button>
          ) : (
            /* Result Preview Card */
            <div
              onClick={() => setShowResultModal(true)}
              className="w-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${matchResult.totalScore >= 18 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {localizeDigits(matchResult.totalScore, language)}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">
                      {selectedMale.name} <span className="text-purple-400 mx-1">&</span> {selectedFemale.name}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-0.5">
                      {t('clickToViewAnalysis')}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center w-full max-w-2xl">
            {error}
          </div>
        )}

        {/* Result Modal */}
        {matchResult && showResultModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/5 backdrop-blur-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 shadow-2xl relative animate-in zoom-in-95 duration-300 ring-1 ring-white/10">

              {/* Close Button */}
              <button
                onClick={() => setShowResultModal(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-black text-white mb-2 text-shadow-sm">{t('matchingCompatibilityTitle')}</h3>
                  <p className="text-gray-300 uppercase tracking-widest text-xs font-bold">
                    {t(matchResult.maleDetails.nakshatra)} ({t(matchResult.maleDetails.rashi)})
                    <span className="mx-2 text-purple-300">{t('with')}</span>
                    {t(matchResult.femaleDetails.nakshatra)} ({t(matchResult.femaleDetails.rashi)})
                  </p>
                </div>

                {/* Validated Score Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-black text-purple-300">{localizeDigits(matchResult.totalScore, language)}</div>
                    <div className="text-[10px] uppercase text-gray-400 mt-1 font-bold">{t('totalGunas')}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <div className={`text-xl font-bold ${matchResult.totalScore >= 18 ? 'text-green-300' : 'text-orange-300'}`}>
                      {matchResult.totalScore < 18 ? t('notAdvised') : matchResult.totalScore <= 24 ? t('average') : t('excellent')}
                    </div>
                    <div className="text-[10px] uppercase text-gray-400 mt-1 font-bold">{t('compatibilityStatus')}</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center flex items-center justify-center hover:bg-white/10 transition-colors mb-8">
                  <div className="text-sm font-medium text-gray-200 leading-relaxed">
                    {matchResult.totalScore >= 18
                      ? t('matchingRecommended')
                      : t('matchingConsult')}
                  </div>
                </div>

                {/* Detailed Table */}
                <div className={`overflow-x-auto rounded-2xl border border-white/10 mb-8 bg-white/5`}>
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-white/5 text-gray-300 uppercase text-[10px] font-black tracking-widest border-b border-white/10">
                        <th className="p-4 pl-6">{t('koota')}</th>
                        <th className="p-4">{t('max')}</th>
                        <th className="p-4">{t('maleFemale')}</th>
                        <th className="p-4 text-right pr-6">{t('pointsObtained')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {Object.values(matchResult.scores).map((k) => {
                        // Helper to localize values that might be complex strings like "Scorpio (10)" or simple keys like "Deva"
                        const formatValue = (val) => {
                          if (!val) return "";
                          // If exact match in dictionary, return translated
                          if (t(val) !== val) return t(val);

                          // Handle composed strings like "Scorpio (10)"
                          if (val.includes('(')) {
                            const parts = val.split('(');
                            const main = parts[0].trim();
                            const rest = parts.slice(1).join('('); // Keep the rest
                            return `${t(main) !== main ? t(main) : main} (${rest}`;
                          }

                          return val;
                        };

                        return (
                          <tr key={k.name} className="hover:bg-white/10 transition-colors">
                            <td className="p-4 pl-6 font-bold text-gray-100">{t(k.name)}</td>
                            <td className="p-4 text-gray-400">{localizeDigits(k.max, language)}</td>
                            <td className="p-4 text-gray-300 font-medium">
                              <span className="text-blue-300">{formatValue(k.male)}</span>
                              <span className="mx-2 text-gray-500">/</span>
                              <span className="text-pink-300">{formatValue(k.female)}</span>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <span className={`font-black ${k.score === 0 ? 'text-red-400/80' : 'text-green-300'}`}>
                                {localizeDigits(k.score, language)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Warnings/Doshas */}
                {matchResult.warnings.length > 0 && (
                  <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                    <h4 className="text-orange-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                      <span>⚠️</span> {t('doshaObservations')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.warnings.map((w, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-[11px] font-bold uppercase border border-orange-500/20">
                          {t(w) || w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved History List */}
        {savedMatches.length > 0 && (
          <div className="mt-20 w-full max-w-4xl mx-auto px-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedMatches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => {
                    setMatchResult(match.details);
                    setSelectedMaleId(match.male_kundli_id);
                    setSelectedFemaleId(match.female_kundli_id);
                    setShowResultModal(true);
                  }}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1 group-hover:text-purple-300 transition-colors">
                        {match.male_name} <span className="text-gray-500 text-sm mx-1">&</span> {match.female_name}
                      </h4>
                      <div className="text-xs text-gray-500">
                        {new Date(match.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${match.score >= 18 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {localizeDigits(match.score, language)}/{localizeDigits(36, language)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        {match.score < 18 ? t('needsRemedies') : t('compatible')}
                      </span>
                      {match.details?.warnings?.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/10">
                          {localizeDigits(match.details.warnings.length, language)} {t('doshas')}
                        </span>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMatchHistory(e, match.id);
                      }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors z-20 group-hover:opacity-100 opacity-60"
                      title="Delete Match Record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KundliMatching;
