'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateTraditionalKundliPDF } from '../utils/TraditionalKundliPDF';
import { HouseDetails } from '../lib/vedicjyotish/constants/Houses';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DateTime } from 'luxon';
import DynamicKundliChart from './DynamicKundliChart';
import StrengthAnalysis from './StrengthAnalysis';
import { kundaliGenerationService } from '../lib/kundaliGenerationService';
import { RemedyData } from '../lib/vedicjyotish/RemedyData';
import { formatToNepaliDate, toNepaliNumerals } from '../lib/vedicjyotish/services/NepaliLocalization';
import PlanetaryData from '../lib/vedicjyotish/data/PlanetaryRemedies.json';

export default function AIKundliAnalysis({ selectedKundli, onClose, userEmail, userPreferences, initialTab = 'overview' }) {
    const { currentTheme } = useTheme();
    const { t, language, changeLanguage } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedHouse, setSelectedHouse] = useState(null); // New state for interactive house click

    // New AI generation states
    const [aiLoading, setAiLoading] = useState(false);
    const [aiProgress, setAiProgress] = useState(0);
    const [aiPredictions, setAiPredictions] = useState(null);
    const [activeRemedy, setActiveRemedy] = useState(null);
    const [selectedDashaSystem, setSelectedDashaSystem] = useState('vimshottari');
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (activeTab === 'china' && !pdfUrl && analysisData) {
            const generatePDF = async () => {
                try {
                    // Combine data for the traditional PDF generator
                    // It expects a full kundli object like in KundliPage
                    const fullData = {
                        ...selectedKundli,
                        ...analysisData,
                        // Ensure nested structures are present if needed by deepFind
                        kundaliData: analysisData.kundaliData || analysisData.planets
                    };

                    const blobUrl = await generateTraditionalKundliPDF(fullData, 'blob');
                    if (blobUrl) {
                        setPdfUrl(blobUrl);
                    }
                } catch (error) {
                    console.error("Failed to generate Traditional PDF:", error);
                }
            };

            generatePDF();
        }
    }, [activeTab, analysisData, pdfUrl, selectedKundli]);
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [dynamicDasha, setDynamicDasha] = useState(null);
    const [expandedMD, setExpandedMD] = useState(null);
    const [expandedAD, setExpandedAD] = useState(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showBirthDetails, setShowBirthDetails] = useState(false);
    const [showVedicIndicators, setShowVedicIndicators] = useState(true);
    const [dashaAiLoading, setDashaAiLoading] = useState(false);
    const [dashaAiResult, setDashaAiResult] = useState({});
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    // Helper to construct legacy URL parameters
    // Helper to construct legacy URL parameters
    const getLegacyParams = () => {
        // Corrected path: analysisData.kundaliData IS the planets object based on service return
        const planetsData = analysisData?.kundaliData;

        if (!planetsData) {
            return '';
        }

        const mapPlanetToKey = {
            'Ascendant': 'Lagna',
            'Sun': 'Sun',
            'Moon': 'Moon',
            'Mars': 'Mars',
            'Mercury': 'Merc',
            'Jupiter': 'Jup',
            'Venus': 'Ven',
            'Saturn': 'Sat',
            'Rahu': 'Rahu',
            'Ketu': 'Ketu'
        };

        const signToDegree = {
            'Aries': 0, 'Tau': 30, 'Taurus': 30, 'Gem': 60, 'Gemini': 60, 'Can': 90, 'Cancer': 90,
            'Leo': 120, 'Vir': 150, 'Virgo': 150, 'Lib': 180, 'Libra': 180, 'Sco': 210, 'Scorpio': 210,
            'Sag': 240, 'Sagittarius': 240, 'Cap': 270, 'Capricorn': 270, 'Aqu': 300, 'Aquarius': 300, 'Pis': 330, 'Pisces': 330,
            'Mesha': 0, 'Vrishabha': 30, 'Mithuna': 60, 'Karka': 90,
            'Simha': 120, 'Kanya': 150, 'Tula': 180, 'Vrishchika': 210,
            'Dhanu': 240, 'Makara': 270, 'Kumbha': 300, 'Meena': 330
        };

        const params = new URLSearchParams();

        // Map all planets
        Object.entries(planetsData).forEach(([name, data]) => {
            const key = mapPlanetToKey[name] || name;
            let totalDeg = 0;

            if (typeof data.totalDegree === 'number') {
                totalDeg = data.totalDegree;
            } else if (data.sign) {
                // Remove any degree symbol or extra chars if present (defensive)
                const signName = data.sign.replace(/[^\w\s]/g, '').trim();
                // Check for first 3 chars match if full match fails
                const signStart = signToDegree[signName] || signToDegree[signName.substring(0, 3)] || 0;
                const deg = data.normDegree || data.degree || 0;
                totalDeg = signStart + deg;
            } else if (data.degree) {
                // Fallback if we just have a raw degree that might be total
                totalDeg = Number(data.degree);
            }

            params.append(key, totalDeg.toFixed(4));
        });

        // Add specific params for Dasa
        if (planetsData.Moon) {
            let moonTotal = 0;
            const mData = planetsData.Moon;
            if (typeof mData.totalDegree === 'number') {
                moonTotal = mData.totalDegree;
            } else if (mData.sign) {
                const signName = mData.sign.replace(/[^\w\s]/g, '').trim();
                const signStart = signToDegree[signName] || signToDegree[signName.substring(0, 3)] || 0;
                moonTotal = signStart + (mData.normDegree || mData.degree || 0);
            }
            params.append('sphuta', moonTotal.toFixed(4));
        }

        // Static params required by legacy engine
        const birthDateObj = new Date(selectedKundli.birth_year, selectedKundli.birth_month - 1, selectedKundli.birth_day, selectedKundli.birth_hour, selectedKundli.birth_minute);

        // Format date as "19 Jul 1971" for legacy parser
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateStr = `${birthDateObj.getDate()} ${months[birthDateObj.getMonth()]} ${birthDateObj.getFullYear()} ${birthDateObj.getHours()}:${birthDateObj.getMinutes()}`;

        params.append('datetime', dateStr);
        params.append('year', selectedKundli.birth_year);
        // Ensure month is 1-indexed (1-12)
        params.append('month', selectedKundli.birth_month);
        params.append('day', selectedKundli.birth_day);

        // Format btime as HH:MM:SS
        const pad = (n) => n.toString().padStart(2, '0');
        const btime = `${pad(selectedKundli.birth_hour)}:${pad(selectedKundli.birth_minute)}:${pad(selectedKundli.birth_second || 0)}`;
        params.append('btime', btime);

        params.append('timezone', selectedKundli.timezone || 5.75); // Nepali standard default
        params.append('latitude', selectedKundli.birth_latitude);
        params.append('longitude', selectedKundli.birth_longitude);
        params.append('lang', language === 'ne' ? 'ne' : 'en');
        params.append('placename', selectedKundli.birth_place);
        params.append('chartname', selectedKundli.name);
        // Pass current language (en or ne)

        params.append('submit', 'Calculate');

        // Dasa defaults
        params.append('desc', 'Vimshottari Dasa');
        params.append('dasha', 'Vimshottari');
        params.append('ayush', '120');
        params.append('starting', '0'); // Janma
        params.append('compression', '1');

        // Amsha defaults
        params.append('Division', 'Rashi');

        const paramsStr = params.toString();
        return paramsStr;
    };

    useEffect(() => {
        const generateAnalysis = async () => {
            try {
                setLoading(true);
                // Reset UI states for fresh view on new kundli
                setShowVedicIndicators(true);
                setShowBirthDetails(false);
                setAiPredictions(null);

                const birthData = {
                    name: selectedKundli.name,
                    birthYear: selectedKundli.birth_year,
                    birthMonth: selectedKundli.birth_month,
                    birthDay: selectedKundli.birth_day,
                    birthHour: selectedKundli.time_system === 'PM' && selectedKundli.birth_hour !== 12
                        ? selectedKundli.birth_hour + 12
                        : selectedKundli.time_system === 'AM' && selectedKundli.birth_hour === 12
                            ? 0
                            : selectedKundli.birth_hour,
                    birthMinute: selectedKundli.birth_minute,
                    birthSecond: selectedKundli.birth_second || 0,
                    latitude: selectedKundli.birth_latitude,
                    longitude: selectedKundli.birth_longitude,
                    timezone: selectedKundli.timezone || 5.75,
                    city: selectedKundli.birth_place,
                    // Pass advanced fields
                    fatherName: selectedKundli.fatherName || selectedKundli.father_name,
                    motherName: selectedKundli.motherName || selectedKundli.mother_name,
                    gotra: selectedKundli.gotra,
                    nawranName: selectedKundli.nawranName || selectedKundli.nawran_name
                };

                // Pass true for skipAI to get immediate results
                const result = await kundaliGenerationService.generateCompleteKundali(birthData, (p) => setProgress(p), true, language);
                if (result.success) {
                    setAnalysisData(result.data);

                    // CHECK CACHE
                    let cachedPredictions = null;
                    if (userEmail) {
                        try {
                            const cacheRes = await fetch(`/api/kundli-storage?name=${encodeURIComponent(selectedKundli.name)}&email=${encodeURIComponent(userEmail)}`);
                            const cacheData = await cacheRes.json();

                            if (cacheData.aiPredictions || cacheData.predictions) {
                                console.log('✅ [Cache] Hit! Loading predictions...');
                                const cachedData = cacheData.aiPredictions || cacheData.predictions;

                                // Validate cache content (must have actual prediction keys, not just loading)
                                if (cachedData && Object.keys(cachedData).length > 3) {
                                    cachedPredictions = cachedData;
                                    setAiPredictions(cachedData);

                                    // Update selection data so other parts of the UI (tabs) see it
                                    setAnalysisData(prev => ({
                                        ...prev,
                                        analysis: {
                                            ...prev.analysis,
                                            predictions: cachedData
                                        }
                                    }));
                                    setLoading(false);
                                } else {
                                    console.warn('⚠️ [Cache] Found invalid/corrupted cache, ignoring:', cachedData);
                                }
                            }

                            // IMMEDIATE SAVE of Base Data (if not already saved or to update details)
                            // We save the full generated result to ensure the JSON file is created immediately.
                            // Construct body for save
                            // GENERATE PLANETARY ANALYSIS (mirroring UI logic)
                            // This ensures the detailed text (House Meanings, Effects) is stored
                            const generatedPlanetaryAnalysis = {};
                            const pData = result.data.kundaliData;


                            const mainPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

                            if (pData) {
                                console.log('[Debug] kundliData keys:', Object.keys(pData)); // DEBUG KEYS
                                mainPlanets.forEach(planet => {
                                    const details = pData[planet];
                                    if (!details) return;

                                    const houseNum = (typeof details.house === 'object' && details.house !== null) ? details.house.num : details.house;

                                    const signName = details.sign;
                                    const houseInfo = HouseDetails[houseNum];
                                    const remedyInfo = houseNum ? PlanetaryData[planet]?.[String(houseNum)] : null;

                                    if (houseInfo && remedyInfo) {
                                        // Calculate strength (simplified version of UI logic)
                                        const baseStrength = 75;
                                        const variance = (planet.charCodeAt(0) + (houseNum * 5)) % 15;
                                        const strengthPct = Math.min(98, Math.max(12, baseStrength + variance - 4));

                                        generatedPlanetaryAnalysis[planet] = {
                                            house: houseNum,
                                            sign: signName,
                                            house_info: houseInfo,
                                            remedies: remedyInfo,
                                            strength: {
                                                positive: strengthPct,
                                                challenges: 100 - strengthPct
                                            },
                                            ui_text: {
                                                house_meaning: houseInfo.description,
                                                positive_effects: remedyInfo.good,
                                                negative_effects: remedyInfo.bad,
                                                foundation_sign: houseInfo.naturalSign,
                                                placement_rule: houseInfo.exaltationDetail
                                            }
                                        };
                                    }
                                });
                            }


                            console.log('[AIKundliAnalysis] Generated Planetary Analysis:', Object.keys(generatedPlanetaryAnalysis));

                            const saveBody = {
                                userId: selectedKundli.user_id || selectedKundli.userId, // Send User ID if available
                                name: selectedKundli.name,
                                email: userEmail,
                                ...result.data,
                                planetaryAnalysis: generatedPlanetaryAnalysis
                            };

                            // Only include predictions if we actually retrieved them from cache to preserve them
                            // Otherwise, omit the key so the backend preserves what it has (if anything)
                            if (cachedPredictions) {
                                saveBody.aiPredictions = cachedPredictions;
                            }

                            console.log('[AIKundliAnalysis] Sending save request with userId:', saveBody.userId);
                            const response = await fetch('/api/kundli-storage', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(saveBody)
                            });
                            console.log('[AIKundliAnalysis] Save response status:', response.status);
                            if (!response.ok) {
                                const errText = await response.text();
                                console.error('[AIKundliAnalysis] Save failed:', errText);
                            } else {
                                console.log('[AIKundliAnalysis] Save successful');
                            }

                        } catch (cacheErr) {
                            console.error('❌ [Cache] Error:', cacheErr);
                        }
                    }

                    if (!cachedPredictions) {
                        // Initialize with partial analysis if AI was skipped and no cache
                        if (result.data.analysis?.predictions?.loading) {
                            // Only reset if we don't currently have local predictions
                            // This prevents a race condition where manual generation finishes before this effect completes
                            setAiPredictions(prev => prev || null);
                        } else {
                            // Only set if we have actual content keys
                            const initialPreds = result.data.analysis?.predictions;
                            if (initialPreds && Object.keys(initialPreds).length > 3) {
                                setAiPredictions(initialPreds);
                            } else {
                                // Keep existing if valid, otherwise null
                                setAiPredictions(prev => prev || null);
                            }
                        }
                    }
                } else {
                    console.error('AI Analysis failed:', result.error);
                    setError(result.error);
                }
            } catch (error) {
                console.error('Error fetching AI analysis:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (selectedKundli) {
            generateAnalysis();
        }
    }, [selectedKundli, userEmail]);

    useEffect(() => {
    }, [analysisData]);

    const handleRunAiAnalysis = async () => {
        if (!analysisData?.facts || aiLoading) return;

        try {
            setAiLoading(true);
            setAiProgress(0);

            // Symbolic progress simulation
            const interval = setInterval(() => {
                setAiProgress(prev => prev < 90 ? prev + Math.random() * 15 : prev);
            }, 500);

            const predictions = await kundaliGenerationService.generateGroundedPredictions(
                analysisData.facts,
                null,
                language,
                (partialData) => {
                    // LIVE STREAM UPDATE
                    setAiPredictions(prev => ({
                        ...prev,
                        ...partialData
                    }));
                }
            );

            clearInterval(interval);
            setAiProgress(100);

            if (predictions) {
                setAiPredictions(predictions); // Final set to ensure completeness
                // Update analysis data so other components have access
                setAnalysisData(prev => ({
                    ...prev,
                    analysis: {
                        ...prev.analysis,
                        predictions: predictions
                    }
                }));

                // SAVE TO CACHE
                if (userEmail) {
                    try {
                        console.log('[AIKundliAnalysis] Manual save sending userId:', selectedKundli.user_id || selectedKundli.userId);
                        await fetch('/api/kundli-storage', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedKundli.user_id || selectedKundli.userId, // Send User ID
                                name: selectedKundli.name,
                                email: userEmail,
                                aiPredictions: predictions
                            })
                        });
                    } catch (cacheErr) {
                        console.error('❌ [Cache] Save failed:', cacheErr);
                    }
                }
            }
        } catch (err) {
            console.error("Manual AI Generation Error:", err);
            setError("Failed to generate AI predictions. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleAnalyzePeriod = async () => {
        if (!dynamicDasha?.[selectedDashaSystem] || dashaAiLoading) return;

        try {
            setDashaAiLoading(true);

            // Clear only current system's result if re-analyzing
            setDashaAiResult(prev => ({ ...prev, [selectedDashaSystem]: '' }));

            const currentSystemData = dynamicDasha[selectedDashaSystem];

            // Helper to get descriptive name for a dasha period
            const getDescriptiveName = (period) => {
                if (!period) return 'Unknown';
                const name = period.Name || period.name;
                const planet = period.Lord || period.planet;
                // For Yogini, include both Name (Mangala) and Lord (Moon)
                if (selectedDashaSystem === 'yogini' && name && planet && name !== planet) {
                    return `${name} (${planet})`;
                }
                return name || planet;
            };

            const dashaInfo = {
                system: selectedDashaSystem,
                mahadasha: {
                    name: getDescriptiveName(currentSystemData.mahadasha || currentSystemData.active),
                    start: currentSystemData.mahadasha?.start || currentSystemData.active?.start,
                    end: currentSystemData.mahadasha?.end || currentSystemData.active?.end
                },
                antardasha: {
                    name: getDescriptiveName(currentSystemData.antardasha),
                    start: currentSystemData.antardasha?.start,
                    end: currentSystemData.antardasha?.end
                },
                pratyantardasha: {
                    name: getDescriptiveName(currentSystemData.pratyantardasha),
                    start: currentSystemData.pratyantardasha?.start,
                    end: currentSystemData.pratyantardasha?.end
                }
            };

            // Extract upcoming dashas from timeline
            const timeline = currentSystemData.timeline || [];
            const currentMDName = currentSystemData.mahadasha?.lord || currentSystemData.active?.lord || currentSystemData.active?.planet;

            const currentIndex = timeline.findIndex(md => md.lord === currentMDName || md.name === currentMDName);
            const upcoming = [];

            if (currentIndex !== -1) {
                // Get next 2 Mahadashas
                for (let i = currentIndex + 1; i < currentIndex + 3 && i < timeline.length; i++) {
                    const md = timeline[i];
                    upcoming.push({
                        mahadasha: `${md.lord || md.name} (${md.start} to ${md.end})`,
                        antardashas: md.antardashas?.slice(0, 3).map(ad => `${ad.lord || ad.name} (${ad.start} to ${ad.end})`)
                    });
                }
            }

            await kundaliGenerationService.analyzeDashaPeriod(
                analysisData.facts,
                dashaInfo,
                upcoming,
                language,
                (text) => setDashaAiResult(prev => ({
                    ...prev,
                    [selectedDashaSystem]: text
                }))
            );

        } catch (err) {
            console.error("Dasha Analysis Error:", err);
            setDashaAiResult(prev => ({
                ...prev,
                [selectedDashaSystem]: "Failed to generate dasha analysis. Please try again."
            }));
        } finally {
            setDashaAiLoading(false);
        }
    };


    useEffect(() => {
        if (analysisData?.rawKundli && targetDate) {
            const date = DateTime.fromISO(targetDate);
            const dashaResult = kundaliGenerationService.calculateDasha(analysisData.rawKundli, date);

            if (dashaResult) {
                // Service now returns strict canonical Tribhagi object.
                // No frontend overrides needed or allowed.
            }

            setDynamicDasha(dashaResult);
        }
    }, [analysisData?.rawKundli, targetDate]);



    // Debug state
    const [tribhagiDebug, setTribhagiDebug] = useState("");

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
                <div className={`${currentTheme.colors.surface} rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border ${currentTheme.colors.border} text-center`}>
                    <div className="relative h-16 w-16 mx-auto mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-purple-500"></div>
                        <span className="text-[10px] font-bold text-purple-400">{progress}%</span>
                    </div>
                    <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-2`}>{t('analyzingAlignments') || 'AI Astrologer is Analyzing...'}</h3>
                    <div className="w-full bg-gray-700/30 h-1.5 rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className={currentTheme.colors.textSecondary}>{t('analysisLoaderDescription') || 'Reading your cosmic blueprint and planetary alignments.'}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <div className={`${currentTheme.colors.surface} rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-500/30 text-center`}>
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-3`}>Analysis Failed</h3>
                    <p className={`${currentTheme.colors.textSecondary} text-sm mb-6 leading-relaxed`}>
                        {error.includes('swe_set_sid_mode')
                            ? "Astronomical library failed to initialize (functions missing)."
                            : error}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={onClose}
                            className={`w-full py-3 ${currentTheme.colors.surface} ${currentTheme.colors.text} rounded-xl font-bold border ${currentTheme.colors.border} hover:bg-white/5 transition-colors`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysisData) return null;

    const { basicInfo, kundaliData, analysis } = analysisData;

    const allTabs = [
        { id: 'overview', label: t('overview'), icon: '✨' },
        { id: 'dashas', label: t('dasha'), icon: '📅' },
        { id: 'analysis', label: t('yogaAndDosha') || 'Yog & Dosha', icon: '🧠' },
        { id: 'details', label: t('detailedAnalysis'), icon: '📜' },
        {
            id: 'strength',
            label: t('strength'),
            icon: '💪',
        },
        { id: 'planet_analysis', label: t('planetaryAnalysis') || 'Planetary Analysis', icon: '🪐' },
        { id: 'remedies', label: t('remedies'), icon: '🕉️' },
        { id: 'china', label: t('china'), icon: '📜' }
    ];

    const tabs = allTabs;
    const isPremium = ['monthly', 'yearly'].includes(userPreferences?.membership?.toLowerCase());

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] ${isMaximized ? 'p-0' : 'p-4 lg:p-8'}`}>
            <div className={`${currentTheme.colors.surface} ${isMaximized ? 'w-full h-full max-h-none rounded-none border-none' : 'max-w-6xl w-full max-h-[90vh] rounded-2xl border'} overflow-hidden flex flex-col shadow-2xl ${currentTheme.colors.border}`}>

                {/* Header */}
                <div className={`p-5 border-b ${currentTheme.colors.border} flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-purple-900/20 via-purple-900/5 to-transparent z-20`}>
                    <div>
                        <h2 className={`text-2xl font-extrabold ${currentTheme.colors.text} flex items-center gap-3`}>
                            <img src="/an.png" alt="Logo" className="w-8 h-8 rounded-full object-contain shadow-lg border border-white/10" />
                            {t('analysisTitle')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner hover:bg-white/5 transition-all"
                            >
                                <img
                                    src={language === 'ne' ? "https://flagcdn.com/w20/np.png" : language === 'fi' ? "https://flagcdn.com/w20/fi.png" : "https://flagcdn.com/w20/us.png"}
                                    alt="Language"
                                    className="w-5 h-auto rounded-sm object-contain"
                                />
                                <span className="text-xs text-gray-300">▼</span>
                            </button>

                            {showLanguageDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-32 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-[110] backdrop-blur-xl">
                                    {[
                                        { code: 'en', label: 'English', flag: 'https://flagcdn.com/w20/us.png' },
                                        { code: 'ne', label: 'नेपाली', flag: 'https://flagcdn.com/w20/np.png' },
                                        { code: 'fi', label: 'Suomi', flag: 'https://flagcdn.com/w20/fi.png' }
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setShowLanguageDropdown(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors ${language === lang.code ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <img src={lang.flag} alt={lang.label} className="w-4 h-auto rounded-sm" />
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className={`p-2 rounded-full hover:bg-white/10 transition-all border ${currentTheme.colors.border} text-lg z-30 flex items-center justify-center`}
                            title={isMaximized ? "Restore" : "Maximize"}
                        >
                            {isMaximized ? '🔳' : '🔲'}
                        </button>

                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full hover:bg-white/10 transition-all border ${currentTheme.colors.border} group text-white/60 hover:text-white z-30`}
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex flex-shrink-0 overflow-x-auto scrollbar-hide border-b ${currentTheme.colors.border} bg-black/60 z-10`}>
                    <div className="flex px-4 gap-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-3 flex items-center gap-3 text-lg font-bold transition-all relative min-w-max outline-none focus:outline-none
                                    ${activeTab === tab.id
                                        ? `text-purple-400 bg-purple-500/5`
                                        : `${currentTheme.colors.textSecondary} hover:text-white hover:bg-white/5`
                                    }`}
                            >
                                <span className="text-2xl">{tab.icon}</span>
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-black/10">

                    {activeTab === 'overview' && (
                        <div className="space-y-12">
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Birth Chart */}
                                <div className="space-y-6 text-center">
                                    <h3 className={`text-2xl font-black ${currentTheme.colors.text} flex items-center gap-3 justify-center`}>
                                        {t('birthChart')}
                                    </h3>
                                    <div className="w-full">
                                        <DynamicKundliChart
                                            chartData={kundaliData}
                                            variant="D1"
                                            activeHouse={selectedHouse?.house}
                                            onHouseSelect={setSelectedHouse}
                                        />
                                    </div>
                                </div>

                                {/* Navamsha Chart */}
                                <div className="space-y-6 text-center">
                                    <h3 className={`text-2xl font-black ${currentTheme.colors.text} flex items-center gap-3 justify-center`}>
                                        {t('navamshaChart')}
                                    </h3>
                                    <div className="w-full">
                                        <DynamicKundliChart chartData={kundaliData} variant="D9" />
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Data & Predictions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                {/* Birth Details & Cosmic Core */}
                                <div className="lg:col-span-1 flex flex-col gap-8 self-start">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`text-2xl font-black ${currentTheme.colors.text}`}>{t('cosmicProfile')}</h3>
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">{language === 'ne' ? toNepaliNumerals('98') : '98'}% {t('accuracy')}</span>
                                    </div>

                                    {/* Primary Indicators (Large Cards) */}
                                    {/* TRIBHAGI DEBUG DISPLAY */}
                                    {tribhagiDebug && (
                                        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 text-xs font-mono rounded">
                                            <strong>DEBUG TRIBHAGI:</strong> {tribhagiDebug}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-transparent border ${currentTheme.colors.border} shadow-2xl backdrop-blur-md relative overflow-hidden group`}>
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-colors"></div>
                                            <p className={`text-[10px] ${currentTheme.colors.textSecondary} mb-2 uppercase tracking-[0.2em] font-black opacity-70`}>{t('ascendant')}</p>
                                            <p className={`text-2xl font-black text-blue-400 tracking-tight`}>{language === 'ne' ? (analysis.ascendant.signNp || t(analysis.ascendant.sign) || analysis.ascendant.sign) : analysis.ascendant.sign}</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="h-1 flex-1 bg-blue-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-400" style={{ width: `${((Number(analysis.ascendant.degree || 0) % 30) / 30) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-500/60 uppercase">{language === 'ne' ? toNepaliNumerals(Number(analysis.ascendant.degree || 0).toFixed(0)) : Number(analysis.ascendant.degree || 0).toFixed(0)}°</span>
                                            </div>
                                        </div>

                                        <div className={`p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-900/10 to-transparent border ${currentTheme.colors.border} shadow-2xl backdrop-blur-md relative overflow-hidden group`}>
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors"></div>
                                            <p className={`text-[10px] ${currentTheme.colors.textSecondary} mb-2 uppercase tracking-[0.2em] font-black opacity-70`}>{t('moonSign')}</p>
                                            <p className={`text-2xl font-black text-purple-400 tracking-tight`}>{language === 'ne' ? (analysis.planets.Moon.signNp || t(analysis.planets.Moon.sign) || analysis.planets.Moon.sign) : analysis.planets.Moon.sign}</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="h-1 flex-1 bg-purple-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-400" style={{ width: `${((analysis.planets.Moon.degree % 30) / 30) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-purple-500/60 uppercase">{language === 'ne' ? toNepaliNumerals(analysis.planets.Moon.degree.toFixed(0)) : analysis.planets.Moon.degree.toFixed(0)}°</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vedic Indicators (Avakahada) - STAYS ON TOP NOW */}
                                    {analysisData?.facts?.avakahada && (
                                        <div className={`rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} shadow-2xl backdrop-blur-xl bg-black/40 overflow-hidden transition-all duration-300`}>
                                            <button
                                                onClick={() => setShowVedicIndicators(!showVedicIndicators)}
                                                className={`w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all group ${showVedicIndicators ? `border-b ${currentTheme.colors.border}` : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-purple-400 text-lg group-hover:scale-110 transition-transform">✨</span>
                                                    <h4 className={`text-xs font-black ${currentTheme.colors.textSecondary} uppercase tracking-[0.2em] opacity-70`}>{t('astrologicalProfile') || 'Vedic Indicators'}</h4>
                                                </div>
                                                <span className={`text-sm transition-transform duration-500 ${showVedicIndicators ? 'rotate-180' : ''}`}>▼</span>
                                            </button>

                                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showVedicIndicators ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                                                <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-6">
                                                    {[
                                                        { icon: '🌙', label: t('rasi') || 'Rasi', value: language === 'ne' ? (t(analysisData.facts.avakahada.rasi) || analysisData.facts.avakahada.rasi) : analysisData.facts.avakahada.rasi },
                                                        { icon: '⭐', label: t('nakshatra') || 'Nakshatra', value: language === 'ne' ? (t(analysisData.facts.avakahada.nakshatra) || analysisData.facts.avakahada.nakshatra) : analysisData.facts.avakahada.nakshatra },
                                                        { icon: '🔢', label: language === 'ne' ? 'चरण' : (t('pada') || 'Pad'), value: language === 'ne' ? toNepaliNumerals(analysisData.facts.avakahada.pada) : analysisData.facts.avakahada.pada },
                                                        {
                                                            icon: '🔤', label: language === 'ne' ? 'अक्षर' : (t('word') || 'Word'), value: language === 'ne' ? (
                                                                {
                                                                    'Chu': 'चु', 'Che': 'चे', 'Cho': 'चो', 'La': 'ला', 'Li': 'लि', 'Lu': 'लु', 'Le': 'ले', 'Lo': 'लो', 'A': 'अ',
                                                                    'I': 'इ', 'U': 'उ', 'E': 'ए', 'O': 'ओ', 'Va': 'व', 'Vi': 'वि', 'Vu': 'वु', 'Ve': 'वे', 'Vo': 'वो',
                                                                    'Ka': 'क', 'Ki': 'कि', 'Ku': 'कु', 'Gha': 'घ', 'Nga': 'ङ', 'Chha': 'छ', 'Ke': 'के', 'Ko': 'को', 'Ha': 'ह',
                                                                    'Hi': 'हि', 'Hu': 'हु', 'He': 'हे', 'Ho': 'हो', 'Da': 'डा', 'Di': 'डि', 'Du': 'डु', 'De': 'डे', 'Do': 'डो',
                                                                    'Ma': 'मा', 'Mi': 'मि', 'Mu': 'मु', 'Me': 'मे', 'Mo': 'मो', 'Ta': 'टा', 'Ti': 'टि', 'Tu': 'टु', 'Te': 'टे',
                                                                    'To': 'टो', 'Pa': 'प', 'Pi': 'पि', 'Pu': 'पु', 'Sha': 'ष', 'Na': 'ण', 'Tha': 'ठ', 'Pe': 'पे', 'Po': 'पो',
                                                                    'Ra': 'रा', 'Ri': 'रि', 'Ru': 'रु', 'Re': 'रे', 'Ro': 'रो', 'Ta': 'त', 'Ti': 'ति', 'Tu': 'तु', 'Te': 'ते',
                                                                    'To': 'तो', 'Na': 'न', 'Ni': 'नि', 'Nī': 'नी', 'Nu': 'नु', 'Ne': 'ने', 'No': 'नो', 'Ya': 'य', 'Yi': 'यि',
                                                                    'Yu': 'यु', 'Ye': 'ये', 'Yo': 'यो', 'Bha': 'भ', 'Bhi': 'भि', 'Bhu': 'भु', 'Dha': 'ध', 'Pha': 'फ', 'Dha': 'ढ',
                                                                    'Bhe': 'भे', 'Bho': 'भो', 'Ja': 'जा', 'Ji': 'जि', 'Ju': 'जु', 'Je': 'जे', 'Jo': 'जो', 'Kha': 'ख', 'Khi': 'खि',
                                                                    'Khu': 'खु', 'Khe': 'खे', 'Kho': 'खो', 'Ga': 'ग', 'Gi': 'गि', 'Gu': 'गु', 'Ge': 'गे', 'Go': 'गो', 'Sa': 'स',
                                                                    'Si': 'सि', 'Su': 'सु', 'Se': 'से', 'So': 'सो', 'Da': 'द', 'Di': 'दि', 'Du': 'दु', 'Tha': 'थ', 'Jha': 'झ',
                                                                    'Nya': 'ञ', 'De': 'दे', 'Do': 'दो', 'Cha': 'च', 'Chi': 'चि'
                                                                }[analysisData.facts.avakahada.word] || analysisData.facts.avakahada.word
                                                            ) : analysisData.facts.avakahada.word
                                                        },
                                                        {
                                                            icon: '👺', label: language === 'ne' ? 'गण' : (t('gan') || 'Gan'), value: language === 'ne' ? (
                                                                { 'Deva': 'देव', 'Manushya': 'मनुष्य', 'Rakshasa': 'राक्षस' }[analysisData.facts.avakahada.gana] || analysisData.facts.avakahada.gana
                                                            ) : analysisData.facts.avakahada.gana
                                                        },
                                                        {
                                                            icon: '🧬', label: language === 'ne' ? 'नाडी' : (t('nadi') || 'Nadi'), value: language === 'ne' ? (
                                                                { 'Adi': 'आदि', 'Madhya': 'मध्य', 'Antya': 'अन्त्य' }[analysisData.facts.avakahada.nadi] || analysisData.facts.avakahada.nadi
                                                            ) : analysisData.facts.avakahada.nadi
                                                        },
                                                        {
                                                            icon: '🐾', label: language === 'ne' ? 'योनी' : (t('yoni') || 'Yoni'), value: language === 'ne' ? (
                                                                {
                                                                    'Ashwa': 'अश्व', 'Gaja': 'गज', 'Mesha': 'मेष', 'Sarpa': 'सर्प', 'Shwan': 'श्वान', 'Marjara': 'मार्जार',
                                                                    'Mushaka': 'मुषक', 'Simha': 'सिंह', 'Mahisha': 'महिष', 'Vyaghra': 'व्याघ्र', 'Mriga': 'मृग', 'Deer': 'मृग',
                                                                    'Vanara': 'वानर', 'Nakula': 'नकुल'
                                                                }[analysisData.facts.avakahada.yoni] || analysisData.facts.avakahada.yoni
                                                            ) : analysisData.facts.avakahada.yoni
                                                        },
                                                        {
                                                            icon: '👑', label: language === 'ne' ? 'वर्ण' : (t('jaat') || 'Jaat'), value: language === 'ne' ? (
                                                                { 'Brahmin': 'ब्राह्मण', 'Kshatriya': 'क्षत्रिय', 'Vaishya': 'वैश्य', 'Shudra': 'शुद्र' }[analysisData.facts.avakahada.varna] || analysisData.facts.avakahada.varna
                                                            ) : analysisData.facts.avakahada.varna
                                                        },
                                                        {
                                                            icon: '🔱', label: language === 'ne' ? 'वश्य' : (t('vashya') || 'Vashya'), value: language === 'ne' ? (
                                                                { 'Chatushpada': 'चतुष्पद', 'Manav': 'मानव', 'Jalachara': 'जलचर', 'Vanachara': 'वनचर', 'Keeta': 'कीट', 'Insect': 'कीट' }[analysisData.facts.avakahada.vashya] || analysisData.facts.avakahada.vashya
                                                            ) : analysisData.facts.avakahada.vashya
                                                        }
                                                    ].map((item, i) => (
                                                        <div key={i} className="space-y-1.5 group cursor-default">
                                                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-sm">{item.icon}</span>
                                                                <span className={`text-[10px] font-black ${currentTheme.colors.textSecondary} uppercase tracking-[0.1em]`}>{item.label}</span>
                                                            </div>
                                                            <p className={`text-sm font-bold ${currentTheme.colors.text} leading-tight`}>{item.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Birth Data Grid - NOW AT BOTTOM */}
                                    <div className={`rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} shadow-2xl backdrop-blur-xl bg-black/40 overflow-hidden transition-all duration-300`}>
                                        <button
                                            onClick={() => setShowBirthDetails(!showBirthDetails)}
                                            className={`w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all group ${showBirthDetails ? `border-b ${currentTheme.colors.border}` : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-blue-400 text-lg group-hover:scale-110 transition-transform">📅</span>
                                                <h4 className={`text-xs font-black ${currentTheme.colors.textSecondary} uppercase tracking-[0.2em] opacity-70`}>{t('birthDetails') || 'Birth Profile'}</h4>
                                            </div>
                                            <span className={`text-sm transition-transform duration-500 ${showBirthDetails ? 'rotate-180' : ''}`}>▼</span>
                                        </button>

                                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showBirthDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                                                {[
                                                    { icon: '📅', label: language === 'ne' ? 'जन्म मिति' : t('birthDate'), value: language === 'ne' ? formatToNepaliDate(DateTime.fromFormat(basicInfo.birthDate, 'd/M/yyyy')) : basicInfo.birthDate },
                                                    { icon: '⏰', label: language === 'ne' ? 'जन्म समय' : t('birthTime'), value: language === 'ne' ? toNepaliNumerals(basicInfo.birthTime).replace('AM', 'बिहान').replace('PM', 'बेलुका') : basicInfo.birthTime },
                                                    { icon: '📍', label: language === 'ne' ? 'जन्म स्थान' : t('birthPlace'), value: basicInfo.place },
                                                    { icon: '🗺️', label: language === 'ne' ? 'अक्षांश / देशान्तर' : t('coordinates'), value: language === 'ne' ? `${toNepaliNumerals(basicInfo.coordinates.latitude.toFixed(2))}°उ, ${toNepaliNumerals(basicInfo.coordinates.longitude.toFixed(2))}°पू` : `${basicInfo.coordinates.latitude.toFixed(2)}°N, ${basicInfo.coordinates.longitude.toFixed(2)}°E` },
                                                    { icon: '🌅', label: language === 'ne' ? 'सूर्योदय' : t('sunrise'), value: language === 'ne' ? toNepaliNumerals(basicInfo.panchanga.sunrise).replace('AM', 'बिहान') : basicInfo.panchanga.sunrise },
                                                    { icon: '🌇', label: language === 'ne' ? 'सूर्यास्त' : t('sunset'), value: language === 'ne' ? toNepaliNumerals(basicInfo.panchanga.sunset).replace('PM', 'बेलुका') : basicInfo.panchanga.sunset },
                                                    { icon: '⏳', label: language === 'ne' ? 'आयु' : t('age'), value: language === 'ne' ? toNepaliNumerals(basicInfo.age).replace('y', ' वर्ष').replace('m', ' महिना').replace('d', ' दिन') : basicInfo.age },
                                                    { icon: '🌙', label: language === 'ne' ? 'तिथि' : t('tithi'), value: language === 'ne' ? (t(basicInfo.panchanga.tithi) || basicInfo.panchanga.tithi) : basicInfo.panchanga.tithi },
                                                    { icon: '🗓️', label: language === 'ne' ? 'वार' : t('bornDay'), value: language === 'ne' ? (t(basicInfo.panchanga.bornDay) || basicInfo.panchanga.bornDay) : basicInfo.panchanga.bornDay },
                                                    { icon: '💎', label: language === 'ne' ? 'अयनांश' : t('ayanamsa'), value: language === 'ne' ? `${toNepaliNumerals(basicInfo.panchanga.ayanamsa)}°` : `${basicInfo.panchanga.ayanamsa}°` }
                                                ].map((item, i) => (
                                                    <div key={i} className="space-y-1.5 group cursor-default">
                                                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-sm">{item.icon}</span>
                                                            <span className={`text-[10px] font-black ${currentTheme.colors.textSecondary} uppercase tracking-[0.1em]`}>{item.label}</span>
                                                        </div>
                                                        <p className={`text-sm font-bold ${currentTheme.colors.text} leading-tight`}>{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Predictions Column */}
                                <div className="lg:col-span-2 space-y-6 self-start">
                                    <h3 className={`text-xl font-extrabold ${currentTheme.colors.text} flex items-center gap-2`}>
                                        <span className="text-orange-500">☄</span> {t('predictiveIntelligence')}
                                    </h3>

                                    {(!aiPredictions && !aiLoading) ? (
                                        <div className={`p-10 rounded-2xl bg-white/[0.03] border-2 border-dashed ${currentTheme.colors.border} flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden transition-all hover:bg-white/[0.05]`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>

                                            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center text-4xl animate-pulse relative z-10">
                                                🧠
                                            </div>

                                            <div className="space-y-2 relative z-10">
                                                <h4 className={`text-xl font-bold ${currentTheme.colors.text}`}>{t('aiConsultTitle')}</h4>
                                                <p className={`text-sm ${currentTheme.colors.textSecondary} max-w-xs mx-auto`}>
                                                    {t('aiConsultDesc')}
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleRunAiAnalysis}
                                                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 group relative z-10"
                                            >
                                                <span className="relative z-10">{t('beginAnalysis')}</span>
                                                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            {/* Pre-define categories to show placeholders */}
                                            {[
                                                'personality', 'career', 'marriage', 'health', 'wealth',
                                                'education', 'children', 'travel', 'luck', 'spirituality'
                                            ].map((key, index) => {
                                                const val = aiPredictions?.[key];
                                                const isLoaded = !!val;

                                                return (
                                                    <div key={key}
                                                        className={`p-6 rounded-2xl bg-white/[0.03] border ${currentTheme.colors.border} transition-all group relative overflow-hidden flex flex-col gap-3 min-h-[140px] ${!isLoaded ? 'opacity-80' : ''}`}
                                                        style={{ animationDelay: `${index * 100}ms` }}
                                                    >
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-colors"></div>

                                                        {/* Header */}
                                                        <h4 className="text-xs font-black text-purple-400/80 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isLoaded ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-gray-600'}`}></span>
                                                            {t(key) || key}
                                                        </h4>

                                                        {/* Content or Skeleton using standard Tailwind pulse */}
                                                        {isLoaded ? (
                                                            <p className={`text-sm ${currentTheme.colors.textSecondary} leading-relaxed font-semibold italic animate-in fade-in duration-500`}>
                                                                "{val}"
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-2 animate-pulse mt-1">
                                                                <div className="h-2 bg-white/10 rounded w-full"></div>
                                                                <div className="h-2 bg-white/10 rounded w-5/6"></div>
                                                                <div className="h-2 bg-white/10 rounded w-4/6"></div>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                                                    <span className="text-[10px] text-purple-500/50 uppercase tracking-wider">Consulting Stars...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'strength' && (
                        <>
                            <StrengthAnalysis
                                shadbala={analysis?.shadbala}
                                ashtakavarga={analysis?.ashtakavarga}
                                rashiBala={analysis?.rashiBala}
                                muhurta={analysis?.muhurta}
                            />
                            <div style={{ display: 'none' }}>DEBUG-RENDER: Shadbala={analysis?.shadbala ? 'Yes' : 'No'}</div>
                        </>
                    )}



                    {activeTab === 'dashas' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Dasha Controls */}
                            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-normal whitespace-nowrap hidden sm:block">{t('system')}:</span>
                                        <div className="flex w-full sm:w-auto justify-between sm:justify-start bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
                                            {['vimshottari', 'yogini', 'tribhagi'].map(sys => (
                                                <button
                                                    key={sys}
                                                    onClick={() => setSelectedDashaSystem(sys)}
                                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${selectedDashaSystem === sys ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    {language === 'ne' ? (dynamicDasha?.[sys]?.systemNp || t(sys)) : (dynamicDasha?.[sys]?.system || sys)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Validation Badge */}
                                    <div className={`w-full md:w-auto justify-center px-4 py-1.5 rounded-xl border flex items-center gap-2 ${dynamicDasha?.status === 'accurate' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dynamicDasha?.status === 'accurate' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-normal leading-none">
                                            {dynamicDasha?.status === 'accurate' ? t('accurateCalculated') : t('dataMissing')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                    <button
                                        onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
                                        className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400 hover:text-white hover:bg-white/10 transition-all text-center"
                                    >
                                        {t('today')}
                                    </button>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-normal whitespace-nowrap min-w-max">{t('dateSelector')}:</span>
                                        <input
                                            type="date"
                                            value={targetDate}
                                            onChange={(e) => setTargetDate(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dasha Display Logic */}
                            {(() => {
                                return null;
                            })()}
                            {!dynamicDasha || dynamicDasha.error ? (
                                <div className={`p-10 rounded-2xl bg-white/[0.03] border-2 border-dashed ${currentTheme.colors.border} flex flex-col items-center justify-center text-center space-y-6`}>
                                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-4xl">📅</div>
                                    <div className="space-y-2">
                                        <h4 className={`text-xl font-bold ${currentTheme.colors.text}`}>{t('dataMissing')}</h4>
                                        <p className={`text-sm ${currentTheme.colors.textSecondary} max-w-xs mx-auto`}>
                                            {t('missingPointsDesc')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Current Dasha Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Mahadasha Card */}
                                        <div className={`p-8 rounded-2xl bg-gradient-to-br from-purple-600/20 via-blue-900/10 to-transparent border ${currentTheme.colors.border} shadow-2xl backdrop-blur-xl relative overflow-hidden group`}>
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full"></div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-normal mb-4">{t('activeMahadasha')}</p>
                                                <div className="flex items-end justify-between mb-2">
                                                    <h3 className="text-4xl font-black text-white tracking-tighter">
                                                        {selectedDashaSystem === 'yogini'
                                                            ? (language === 'ne'
                                                                ? (dynamicDasha[selectedDashaSystem]?.mahadasha?.nameNp || dynamicDasha[selectedDashaSystem]?.active?.nameNp)
                                                                : (dynamicDasha[selectedDashaSystem]?.mahadasha?.name || dynamicDasha[selectedDashaSystem]?.active?.name))
                                                            : (language === 'ne'
                                                                ? (dynamicDasha[selectedDashaSystem]?.mahadasha?.planetNp || dynamicDasha[selectedDashaSystem]?.active?.planetNp)
                                                                : (dynamicDasha[selectedDashaSystem]?.mahadasha?.planet || dynamicDasha[selectedDashaSystem]?.active?.planet))}
                                                    </h3>
                                                    {selectedDashaSystem === 'vimshottari' && dynamicDasha.vimshottari.mahadasha?.remaining_years && (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-normal opacity-60">{t('remaining')}</span>
                                                            <span className="text-lg font-black text-white leading-none">
                                                                {language === 'ne' ? toNepaliNumerals(dynamicDasha.vimshottari.mahadasha.remaining_years) : dynamicDasha.vimshottari.mahadasha.remaining_years}<span className="text-[10px] opacity-40 ml-1">{t('years')}</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedDashaSystem === 'tribhagi' && dynamicDasha.tribhagi?.phase && (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-normal opacity-60">{language === 'ne' ? 'भाग' : 'Phase'}</span>
                                                            <span className="text-lg font-black text-white leading-none whitespace-nowrap">
                                                                {language === 'ne' ? dynamicDasha.tribhagi.phaseNp : `${dynamicDasha.tribhagi.phase} (${dynamicDasha.tribhagi.phase_fraction})`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase opacity-50">{t('start')}</span>
                                                        <span className="text-white">{language === 'ne' ? (dynamicDasha[selectedDashaSystem]?.mahadasha?.startNp || dynamicDasha[selectedDashaSystem]?.active?.startNp) : (dynamicDasha[selectedDashaSystem]?.mahadasha?.start || dynamicDasha[selectedDashaSystem]?.active?.start)}</span>
                                                    </div>
                                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase opacity-50">{t('end')}</span>
                                                        <span className="text-white">{language === 'ne' ? (dynamicDasha[selectedDashaSystem]?.mahadasha?.endNp || dynamicDasha[selectedDashaSystem]?.active?.endNp) : (dynamicDasha[selectedDashaSystem]?.mahadasha?.end || dynamicDasha[selectedDashaSystem]?.active?.end)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Antardasha Card */}
                                        <div className={`p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-900/10 to-transparent border ${currentTheme.colors.border} shadow-2xl backdrop-blur-xl relative overflow-hidden group`}>
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full"></div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-normal mb-4">{t('activeAntardasha')}</p>
                                                <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
                                                    {selectedDashaSystem === 'yogini'
                                                        ? (language === 'ne' ? dynamicDasha[selectedDashaSystem]?.antardasha?.nameNp : dynamicDasha[selectedDashaSystem]?.antardasha?.name)
                                                        : ((language === 'ne' ? (dynamicDasha[selectedDashaSystem]?.antardasha?.planetNp || dynamicDasha[selectedDashaSystem]?.antardasha?.nameNp) : (dynamicDasha[selectedDashaSystem]?.antardasha?.planet || dynamicDasha[selectedDashaSystem]?.antardasha?.name)))}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase opacity-50">{t('start')}</span>
                                                        <span className="text-white">{language === 'ne' ? dynamicDasha[selectedDashaSystem]?.antardasha?.startNp : dynamicDasha[selectedDashaSystem]?.antardasha?.start}</span>
                                                    </div>
                                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase opacity-50">{t('end')}</span>
                                                        <span className="text-white">{language === 'ne' ? dynamicDasha[selectedDashaSystem]?.antardasha?.endNp : dynamicDasha[selectedDashaSystem]?.antardasha?.end}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pratyantar Card */}
                                        <div className={`p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 via-slate-900/10 to-transparent border ${currentTheme.colors.border} shadow-2xl backdrop-blur-xl relative overflow-hidden group`}>
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full"></div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-normal mb-4">{t('pratyantarDasha')}</p>
                                                <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
                                                    {selectedDashaSystem === 'yogini'
                                                        ? (language === 'ne' ? dynamicDasha[selectedDashaSystem]?.pratyantardasha?.nameNp : dynamicDasha[selectedDashaSystem]?.pratyantardasha?.name)
                                                        : ((language === 'ne' ? (dynamicDasha[selectedDashaSystem]?.pratyantardasha?.planetNp || dynamicDasha[selectedDashaSystem]?.pratyantardasha?.nameNp) : (dynamicDasha[selectedDashaSystem]?.pratyantardasha?.planet || dynamicDasha[selectedDashaSystem]?.pratyantardasha?.name)))}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase opacity-50">{t('start')}</span>
                                                        <span className="text-white">{language === 'ne' ? dynamicDasha[selectedDashaSystem]?.pratyantardasha?.startNp : dynamicDasha[selectedDashaSystem]?.pratyantardasha?.start}</span>
                                                    </div>
                                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase opacity-50">{t('end')}</span>
                                                        <span className="text-white">{language === 'ne' ? dynamicDasha[selectedDashaSystem]?.pratyantardasha?.endNp : dynamicDasha[selectedDashaSystem]?.pratyantardasha?.end}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Birth Data Context (Panchang Proof) */}
                                    <div className="mb-8">
                                        <div className={`p-6 rounded-2xl border ${currentTheme.colors.border} bg-white/5`}>
                                            <h3 className={`text-sm font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2`}>
                                                <span className="text-purple-500">✨</span> {t('birthContext')}
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 rounded-2xl bg-black/20">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{t('birthNakshatra')}</p>
                                                    <p className="text-lg font-black text-white">{language === 'ne' ? (dynamicDasha?.birthData?.nakshatraNp || "-") : (dynamicDasha?.birthData?.nakshatra || "-")}</p>
                                                    <p className="text-[10px] text-gray-600">{dynamicDasha?.birthData?.nakshatra || "-"}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-black/20">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{t('padaDegree')}</p>
                                                    <p className="text-lg font-black text-white">{language === 'ne' ? toNepaliNumerals(dynamicDasha?.birthData?.degreeComplete) : dynamicDasha?.birthData?.degreeComplete}°</p>
                                                    <p className="text-[10px] text-gray-600">{t('bhuktaSpent')}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-black/20">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{t('dashaLord')}</p>
                                                    <p className="text-lg font-black text-white">{language === 'ne' ? dynamicDasha?.birthData?.lordNp : dynamicDasha?.birthData?.lord}</p>
                                                    <p className="text-[10px] text-gray-600">{language === 'en' ? (dynamicDasha?.birthData?.lord || "-") : (dynamicDasha?.birthData?.lordNp || "-")}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-black/20">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{t('start')}</p>
                                                    <p className="text-lg font-black text-white">
                                                        {dynamicDasha?.birthData?.balanceDate ? (language === 'ne' ? formatToNepaliDate(dynamicDasha.birthData.balanceDate).split('/')[0] : new Date(dynamicDasha.birthData.balanceDate).getFullYear()) : "-"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-600">{t('bsYear')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    {/* Timeline Section */}
                                    <div>
                                        <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-6 flex items-center justify-between px-2`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-500">⏳</span> {language === 'ne' ? (dynamicDasha?.[selectedDashaSystem]?.systemNp || selectedDashaSystem) : (dynamicDasha?.[selectedDashaSystem]?.system || selectedDashaSystem)} {t('timeline')}
                                            </div>
                                            <button
                                                onClick={handleAnalyzePeriod}
                                                disabled={dashaAiLoading}
                                                className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 overflow-hidden ${dashaAiLoading
                                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/10 hover:border-purple-500/50 hover:from-purple-600/30 hover:to-blue-600/30 text-white shadow-lg hover:shadow-purple-500/20'
                                                    }`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                {dashaAiLoading ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{t('analyzing') || 'Analyzing...'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-purple-400 group-hover:scale-110 transition-transform duration-300">✦</span>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{language === 'ne' ? 'वर्तमान अवधिको विश्लेषण' : 'Analyze Current Period'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </h3>

                                        {/* Dasha AI Result Display */}
                                        {dashaAiResult[selectedDashaSystem] && (() => {
                                            const systemResult = dashaAiResult[selectedDashaSystem];
                                            // Robust splitting logic for AI output
                                            // Split on [UPCOMING] or similar translated headers like [आगामी] or **आगामी** effectively
                                            const parts = systemResult.split(/\[?UPCOMING\]?|\*\*आगामी समय\*\*|\*\*भविष्य\*\*/i);
                                            const present = parts[0].replace(/\[?PRESENT\]?|\*\*प्रस्तुति\*\*|\*\*वर्तमान अवस्था\*\*/gi, '').trim();
                                            const upcoming = parts[1]?.trim();

                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                                    {/* Present Phase */}
                                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 backdrop-blur-md">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl shadow-inner border border-purple-500/20 flex-shrink-0">
                                                                🔮
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{language === 'ne' ? 'वर्तमान अवस्था' : 'Current Phase'}</span>
                                                                    <div className="h-px flex-1 bg-purple-500/10"></div>
                                                                </div>
                                                                <p className="text-sm text-gray-200 leading-relaxed font-medium italic">
                                                                    "{present}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Future Outlook */}
                                                    {upcoming && (
                                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 backdrop-blur-md">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl shadow-inner border border-blue-500/20 flex-shrink-0">
                                                                    🚀
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{language === 'ne' ? 'भविष्यको दृष्टिकोण' : 'Future Outlook'}</span>
                                                                        <div className="h-px flex-1 bg-blue-500/10"></div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-200 leading-relaxed font-medium italic">
                                                                        "{upcoming}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                                            <table className="w-full text-left border-collapse min-w-[700px]">
                                                <thead>
                                                    <tr className="border-b border-white/10 bg-white/5">
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider">{t('dashaPeriod')}</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider">{t('type')}</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider">{t('startDate')}</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider">{t('endDate')}</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-wider text-right">{t('status')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {dynamicDasha[selectedDashaSystem]?.timeline?.map((item, idx) => {
                                                        const targetDate = new Date(dynamicDasha.calculatedAt);
                                                        const start = new Date(item.start);
                                                        const end = new Date(item.end);

                                                        // STRICT DATE CHECK: Active only if targetDate is within [Start, End)
                                                        const isActive = targetDate >= start && targetDate < end;
                                                        const isExpanded = expandedMD === idx;

                                                        return (
                                                            <React.Fragment key={idx}>
                                                                <tr
                                                                    onClick={() => setExpandedMD(isExpanded ? null : idx)}
                                                                    className={`cursor-pointer transition-all hover:bg-white/5 ${isActive ? 'bg-purple-500/10' : ''}`}
                                                                >
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${isActive ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}>
                                                                                {(language === 'ne' ? (item.lordNp || item.lord || "?") : (item.lord || "?"))[0]}
                                                                            </div>
                                                                            <span className={`font-black ${isActive ? 'text-white' : 'text-gray-300'}`}>{language === 'ne' ? (item.lordNp || item.lord) : item.lord}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-[10px] font-bold text-purple-400/80 uppercase">{t('mahadasha')}</td>
                                                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{language === 'ne' ? item.startNp : item.start}</td>
                                                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{language === 'ne' ? item.endNp : item.end}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <div className="flex items-center justify-end gap-3">
                                                                            {isActive && (
                                                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase rounded-full border border-green-500/30">{t('active')}</span>
                                                                            )}
                                                                            <span className="text-gray-600 text-[10px]">{isExpanded ? '▼' : '▶'}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && item.antardashas?.map((ad, i) => {
                                                                    const adStart = new Date(ad.start);
                                                                    const adEnd = new Date(ad.end);
                                                                    const isAdActive = isActive && (targetDate >= adStart && targetDate < adEnd);
                                                                    const isAdExpanded = expandedAD === i;

                                                                    return (
                                                                        <React.Fragment key={`${idx}-${i}`}>
                                                                            <tr
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setExpandedAD(isAdExpanded ? null : i);
                                                                                }}
                                                                                className={`cursor-pointer bg-black/20 hover:bg-black/30 transition-all ${isAdActive ? 'bg-blue-500/10' : ''}`}
                                                                            >
                                                                                <td className="px-6 py-3 pl-14">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className={`w-1.5 h-1.5 rounded-full ${isAdActive ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                                                                                        <span className={`text-sm font-bold ${isAdActive ? 'text-blue-400' : 'text-gray-400'}`}>{language === 'ne' ? ad.lordNp : ad.lord}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-6 py-3 text-[9px] font-bold text-blue-400/60 uppercase">{t('antardasha')}</td>
                                                                                <td className="px-6 py-3 text-[10px] text-gray-500">{language === 'ne' ? ad.startNp : ad.start}</td>
                                                                                <td className="px-6 py-3 text-[10px] text-gray-500">{language === 'ne' ? ad.endNp : ad.end}</td>
                                                                                <td className="px-6 py-3 text-right">
                                                                                    <div className="flex items-center justify-end gap-3">
                                                                                        {isAdActive && (
                                                                                            <span className="text-[10px] text-blue-500 font-black">{t('now')}</span>
                                                                                        )}
                                                                                        <span className="text-gray-700 text-[8px]">{isAdExpanded ? '▼' : '▶'}</span>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                            {isAdExpanded && ad.pratyantardashas?.map((pd, j) => {
                                                                                const pdStart = new Date(pd.start);
                                                                                const pdEnd = new Date(pd.end);
                                                                                const isPdActive = isAdActive && (targetDate >= pdStart && targetDate < pdEnd);
                                                                                return (
                                                                                    <tr key={`${idx}-${i}-${j}`} className={`bg-black/40 ${isPdActive ? 'bg-indigo-500/10' : ''}`}>
                                                                                        <td className="px-6 py-2 pl-24 text-xs text-gray-500">
                                                                                            {language === 'ne' ? pd.lordNp : pd.lord}
                                                                                        </td>
                                                                                        <td className="px-6 py-2 text-[8px] font-medium text-indigo-400/40 uppercase tracking-tighter">{t('pratyantarDasha')}</td>
                                                                                        <td className="px-6 py-2 text-[9px] text-gray-600">{language === 'ne' ? pd.startNp : pd.start}</td>
                                                                                        <td className="px-6 py-2 text-[9px] text-gray-600">{language === 'ne' ? pd.endNp : pd.end}</td>
                                                                                        <td className="px-6 py-2 text-right">
                                                                                            {isPdActive && <div className="w-1 h-1 bg-indigo-500 rounded-full ml-auto animate-pulse"></div>}
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )
                            }
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-8">
                            {/* Yogas */}
                            <div>
                                <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4 flex items-center gap-2`}>
                                    <span className="text-yellow-500">🔱</span> {t('powerfulYogas')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analysis.yogas.map((yoga, idx) => (
                                        <div key={idx} className={`p-6 rounded-2xl border transition-all ${yoga.status === 'Present'
                                            ? 'bg-yellow-500/10 border-yellow-500/30'
                                            : 'bg-white/5 border-white/10 opacity-60'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-bold ${yoga.status === 'Present' ? 'text-yellow-500' : 'text-gray-400'}`}>
                                                    {language === 'ne' ? (yoga.nameNp || t(yoga.name) || yoga.name) : yoga.name}
                                                </h4>
                                                <span className={`text-[10px] uppercase font-bold ${yoga.status === 'Present' ? 'text-yellow-600' : 'text-gray-500'
                                                    }`}>
                                                    {yoga.status === 'Present' ? t('present') : t('absent')}
                                                </span>
                                            </div>
                                            <div className="mt-2 p-3 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                                                {yoga.description && (
                                                    <p className="text-[10px] text-gray-300 font-medium italic">"{language === 'ne' && yoga.descriptionNp ? yoga.descriptionNp : yoga.description}"</p>
                                                )}
                                                <p className="text-[10px] font-mono leading-relaxed text-gray-400">
                                                    <span className="font-bold uppercase tracking-wider text-gray-500">{t('logic')}:</span> {language === 'ne' ? (yoga.logicNp || t(yoga.logic) || yoga.logic) : yoga.logic}
                                                </p>
                                                {aiPredictions?.yogas_analysis?.[yoga.name] && (
                                                    <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 leading-relaxed border-t border-yellow-500/10 pt-2">
                                                        ✨ {typeof aiPredictions.yogas_analysis[yoga.name] === 'object'
                                                            ? (aiPredictions.yogas_analysis[yoga.name].YogaName || aiPredictions.yogas_analysis[yoga.name].analysis || JSON.stringify(aiPredictions.yogas_analysis[yoga.name]))
                                                            : aiPredictions.yogas_analysis[yoga.name]}
                                                    </p>
                                                )}
                                                {yoga.effects && !aiPredictions?.yogas_analysis?.[yoga.name] && (
                                                    <p className="text-[10px] font-medium text-yellow-500/80 leading-relaxed italic">
                                                        <span className="font-bold uppercase tracking-wider not-italic text-yellow-600">{t('impact')}:</span> {language === 'ne' ? (yoga.effectsNp || t(yoga.effects) || yoga.effects) : yoga.effects}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Doshas */}
                            <div>
                                <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4 flex items-center gap-2`}>
                                    <span className="text-red-500">⚡</span> {t('identifiedDoshas')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analysis.doshas.map((dosha, idx) => (
                                        <div key={idx} className={`p-6 rounded-2xl border transition-all ${dosha.status === 'Present'
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : 'bg-green-500/5 border-green-500/10 opacity-70'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-bold ${dosha.status === 'Present' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {language === 'ne' ? (dosha.nameNp || t(dosha.name) || dosha.name) : dosha.name}
                                                </h4>
                                                <span className={`text-[10px] uppercase font-bold ${dosha.status === 'Present' ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {dosha.status === 'Present' ? (language === 'ne' ? 'विद्यमान' : t('present')) : (language === 'ne' ? 'छैन' : t('absent'))}
                                                </span>
                                            </div>
                                            <div className="mt-2 p-3 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                                                {dosha.description && (
                                                    <p className="text-[10px] text-gray-300 font-medium italic">"{language === 'ne' && dosha.descriptionNp ? dosha.descriptionNp : dosha.description}"</p>
                                                )}
                                                <p className="text-[10px] font-mono leading-relaxed text-gray-400">
                                                    <span className="font-bold uppercase tracking-wider text-gray-500">{t('logic')}:</span> {language === 'ne' && dosha.logicNp ? dosha.logicNp : dosha.logic}
                                                </p>
                                                {aiPredictions?.doshas_analysis?.[dosha.name] && (
                                                    <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 leading-relaxed border-t border-red-500/10 pt-2">
                                                        ⚡ {typeof aiPredictions.doshas_analysis[dosha.name] === 'object'
                                                            ? (aiPredictions.doshas_analysis[dosha.name].DoshaName || aiPredictions.doshas_analysis[dosha.name].analysis || JSON.stringify(aiPredictions.doshas_analysis[dosha.name]))
                                                            : aiPredictions.doshas_analysis[dosha.name]}
                                                    </p>
                                                )}
                                                {dosha.effects && !aiPredictions?.doshas_analysis?.[dosha.name] && (
                                                    <p className="text-[10px] font-medium text-red-500/80 leading-relaxed italic">
                                                        <span className="font-bold uppercase tracking-wider not-italic text-red-600 font-black">{t('impact')}:</span> {language === 'ne' && dosha.effectsNp ? dosha.effectsNp : dosha.effects}
                                                    </p>
                                                )}
                                            </div>
                                            {dosha.status === 'Present' && dosha.remedies.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {dosha.remedies.map((r, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setActiveRemedy(RemedyData[r] || { title: r, significance: "Detailed information for this remedy will be added soon." })}
                                                            className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-full hover:bg-red-500/20 transition-all cursor-pointer border border-red-500/10 hover:border-red-500/30"
                                                        >
                                                            {language === 'ne' && dosha.remediesNp ? dosha.remediesNp[i] : r}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Nakshatras */}
                            <div>
                                <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4 flex items-center gap-2`}>
                                    <span className="text-blue-500">⭐</span> {t('nakshatraPlacements')}
                                </h3>
                                <div className={`rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} overflow-hidden shadow-2xl backdrop-blur-md bg-black/40`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[700px]">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/10">
                                                    <th className="px-6 py-4 text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{t('planet')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{t('nakshatra')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{t('pada')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{t('dashaLord')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {Object.entries(analysis.nakshatras).map(([planet, data]) => (
                                                    <tr key={planet} className="hover:bg-white/[0.03] transition-colors group">
                                                        <td className="px-6 py-4 font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-wider text-sm">{language === 'ne' ? (data.planetNp || t(planet) || planet) : t(planet)}</td>
                                                        <td className="px-6 py-4 text-blue-400 font-bold text-sm tracking-tight">{language === 'ne' ? (data.nakshatraNp || t(data.nakshatra) || data.nakshatra) : (t(data.nakshatra) || data.nakshatra)}</td>
                                                        <td className="px-6 py-4 text-white font-black text-sm">{language === 'ne' ? toNepaliNumerals(data.pada) : data.pada}</td>
                                                        <td className="px-6 py-4 font-bold text-blue-300 text-xs tracking-wider opacity-80 uppercase">{language === 'ne' ? (data.lordNp || t(data.lord) || data.lord) : (t(data.lord) || data.lord)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Planets Table */}
                            <div className="mt-8">
                                <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4 flex items-center gap-2`}>
                                    <span className="text-purple-500">🪐</span> {t('planetaryPositions') || 'Planetary Positions'}
                                </h3>
                                <div className={`rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} overflow-hidden shadow-2xl backdrop-blur-md bg-black/40`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/10">
                                                    <th className="px-6 py-4 text-xs font-black text-purple-400 uppercase tracking-[0.2em]">{t('planet')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-purple-400 uppercase tracking-[0.2em]">{t('sign')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-purple-400 uppercase tracking-[0.2em]">{t('degree')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-purple-400 uppercase tracking-[0.2em]">{t('house')}</th>
                                                    <th className="px-6 py-4 text-xs font-black text-purple-400 uppercase tracking-[0.2em]">{t('strength')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {Object.entries(analysis.planets).map(([name, data]) => (
                                                    <tr key={name} className="hover:bg-white/[0.03] transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-wider">{language === 'ne' ? (data.nameNp || t(name) || name) : t(name)}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-bold text-gray-300">{language === 'ne' ? (data.signNp || t(data.sign) || data.sign) : t(data.sign)}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-mono text-gray-400">{Number(data.degree || 0).toFixed(2)}°</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-lg border border-purple-500/20 uppercase tracking-tighter">{t('house')} {data.house}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${data.analysis.strength.toLowerCase().includes('own') || data.analysis.strength.toLowerCase().includes('strong')
                                                                ? 'text-green-400'
                                                                : 'text-orange-400/80'
                                                                }`}>
                                                                {language === 'ne' ? (data.analysis.strengthNp || t(data.analysis.strength) || data.analysis.strength) : t(data.analysis.strength)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            {/* Detailed Analysis (Legacy) - Integrated into a themed card */}
                            <div className={`p-8 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} shadow-2xl backdrop-blur-xl bg-black/40`}>
                                <div className="w-full">
                                    <iframe
                                        src={`/shankar_engine/kundali_home.html?${getLegacyParams()}`}
                                        className="w-full border-none transition-all duration-300"
                                        title="Full Analytic Report"
                                        style={{ background: 'transparent', minHeight: '800px' }}
                                        onLoad={(e) => {
                                            const iframe = e.target;
                                            const resize = () => {
                                                try {
                                                    if (iframe.contentWindow?.document?.body) {
                                                        const height = iframe.contentWindow.document.body.scrollHeight + 50;
                                                        iframe.style.height = height + 'px';
                                                    }
                                                } catch (err) { console.warn("Resize failed", err); }
                                            };
                                            resize();
                                            setTimeout(resize, 500);
                                            setTimeout(resize, 1000);
                                            setTimeout(resize, 2000);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'planet_analysis' && (
                        <div className={`space-y-6 relative ${!isPremium ? 'h-[55vh] overflow-hidden' : ''}`}>
                            {/* Premium Lock Overlay */}
                            {!isPremium && (
                                <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 backdrop-blur-md bg-black/40 rounded-3xl">
                                    <div className="text-center p-8 bg-black/80 rounded-3xl border border-purple-500/30 shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-300 max-w-md mx-4">
                                        <div className="text-6xl mb-6 animate-bounce">🔒</div>
                                        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                                            {t('premiumFeature') || 'Premium Feature'}
                                        </h3>
                                        <p className="text-gray-300 mb-8 leading-relaxed">
                                            {t('upgradeDescription') || 'Unlock detailed planetary analysis, including house placements, strengths, and personalized remedies.'}
                                        </p>
                                        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
                                            {t('upgradeNow') || 'Upgrade Now'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!isPremium ? 'filter blur-sm opacity-50 pointer-events-none select-none' : ''}`}>
                                {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].map((planet) => {
                                    // Robustly find the planet data handling case sensitivity or missing keys
                                    // analysis.planets keys should match 'Sun', 'Moon' etc.
                                    const planetInfo = analysis?.planets?.[planet];
                                    const houseNum = planetInfo?.house;
                                    const houseInfo = houseNum ? HouseDetails[houseNum] : null;
                                    const remedyInfo = houseNum ? PlanetaryData[planet]?.[String(houseNum)] : null;
                                    const signName = language === 'ne' ? t((planetInfo?.sign || "").toLowerCase()) : t(planetInfo?.sign || "");

                                    // Use the same NATURAL_RULES logic for planet analysis
                                    const NATURAL_RULES = {
                                        1: { exalted: ['Sun'], debilitated: ['Saturn'] }, 2: { exalted: ['Moon'], debilitated: ['Ketu'] },
                                        3: { exalted: ['Rahu'], debilitated: ['Ketu'] }, 4: { exalted: ['Jupiter'], debilitated: ['Mars'] },
                                        6: { exalted: ['Mercury'], debilitated: ['Venus'] }, 7: { exalted: ['Saturn'], debilitated: ['Sun'] },
                                        8: { exalted: ['Ketu'], debilitated: ['Rahu'] }, 9: { exalted: ['Jupiter'], debilitated: ['Rahu'] },
                                        10: { exalted: ['Mars'], debilitated: [] }, 11: { exalted: ['Mercury'], debilitated: ['Ketu'] },
                                        12: { exalted: ['Venus'], debilitated: ['Mars'] }
                                    };

                                    const rules = houseNum ? NATURAL_RULES[houseNum] : null;
                                    let naturalStatus = null;
                                    if (rules?.exalted.includes(planet)) naturalStatus = 'exalted';
                                    if (rules?.debilitated.includes(planet)) naturalStatus = 'debilitated';

                                    if (!remedyInfo) return null;

                                    // Refined Strength logic for varied, logical-looking percentages
                                    let baseStrength = 62; // Neutral starting point
                                    const shad = analysis?.shadbala?.[planet];
                                    if (shad && shad.required > 0) {
                                        baseStrength = Math.round((shad.total / shad.required) * 100);
                                    }

                                    // Adjust based on Natural Status (Powerful/Weak)
                                    if (naturalStatus === 'exalted') baseStrength += 19;
                                    if (naturalStatus === 'debilitated') baseStrength -= 21;

                                    // Add minor deterministic variance for "logic" feel (e.g. 71 instead of 75)
                                    const variance = (planet.length * 3 + houseNum * 7) % 9;
                                    const strengthPct = Math.min(98, Math.max(12, baseStrength + variance - 4));
                                    const challengesPct = 100 - strengthPct;

                                    return (
                                        <div key={planet} className={`relative p-6 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} shadow-lg flex flex-col gap-4 overflow-hidden group hover:border-purple-500/50 transition-all`}>
                                            <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity translate-y-4 translate-x-4 pointer-events-none">
                                                <span className="text-8xl font-black">{houseNum}</span>
                                            </div>

                                            <div className="flex items-center gap-3 z-10">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-inner font-black
                                                    ${planet === 'Sun' ? 'bg-orange-500/20 text-orange-400' :
                                                        planet === 'Moon' ? 'bg-white/10 text-white' :
                                                            planet === 'Mars' ? 'bg-red-500/20 text-red-400' :
                                                                planet === 'Mercury' ? 'bg-green-500/20 text-green-400' :
                                                                    planet === 'Jupiter' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                        planet === 'Venus' ? 'bg-pink-500/20 text-pink-400' :
                                                                            planet === 'Saturn' ? 'bg-blue-900/40 text-blue-400' :
                                                                                'bg-gray-500/20 text-gray-400'}`}>
                                                    {planet.substring(0, 2)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-lg text-white">{language === 'ne' ? (analysis?.planets?.[planet]?.nameNp || planet) : t(planet)}</h4>
                                                        <div className="flex gap-1">
                                                            {naturalStatus === 'exalted' && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-black rounded border border-green-500/30 animate-pulse">{t('maxPower') || 'MAX POWER'}</span>}
                                                            {naturalStatus === 'debilitated' && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-black rounded border border-red-500/30">{t('weakened') || 'WEAKENED'}</span>}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-400">
                                                        {t('house')} {language === 'ne' ? toNepaliNumerals(houseNum) : houseNum} • {signName}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 z-10">
                                                {/* Easy Understanding / Personalized Summary */}
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                    <>
                                                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                                            {t('yourPlanetIs', {
                                                                planet: (language === 'ne' ? (t(planet) || planet) : t(planet)),
                                                                house: (language === 'ne' ? toNepaliNumerals(houseNum) : houseNum),
                                                                aka: (language === 'ne' ? (houseInfo?.akaNp || houseInfo?.aka) : (houseInfo?.aka || t('unknownSign')))
                                                            })}
                                                            {" "}
                                                            {t('influenceStats', {
                                                                strength: (language === 'ne' ? toNepaliNumerals(strengthPct) : strengthPct),
                                                                challenges: (language === 'ne' ? toNepaliNumerals(challengesPct) : challengesPct)
                                                            })}
                                                        </p>
                                                        <p className="text-[10px] text-indigo-200/80 mt-2 italic leading-tight">
                                                            "{t('meaningSummary', {
                                                                good: (language === 'ne' ? (remedyInfo.goodNp || remedyInfo.good || "सकारात्मक परिणामहरू") : (remedyInfo.good || "positive outcomes")).split('.')[0],
                                                                bad: (language === 'ne' ? (remedyInfo.badNp || remedyInfo.bad || "केही कठिनाइहरू") : (remedyInfo.bad || "some difficulties")).split('.')[0].toLowerCase()
                                                            })}"
                                                        </p>
                                                    </>
                                                </div>

                                                {/* Logic / Significance */}
                                                <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                                                    <h5 className="text-[10px] uppercase font-black text-purple-300 mb-2 flex justify-between items-center">
                                                        <span>{t('houseLogic') || "House Meaning"}</span>
                                                        <span className="bg-purple-500/30 px-2 py-0.5 rounded text-[8px] text-white">{(language === 'ne' ? (houseInfo?.akaNp || houseInfo?.aka) : (houseInfo?.aka || t('unknownSign')))}</span>
                                                    </h5>
                                                    <p className="text-[11px] text-gray-200 leading-relaxed font-medium">
                                                        {language === 'ne' ? (houseInfo?.descriptionNp || houseInfo?.description) : (houseInfo?.description || houseInfo?.aka)}
                                                    </p>
                                                    <div className="mt-3 pt-3 border-t border-purple-500/20 grid grid-cols-2 gap-2 text-[9px]">
                                                        <div>
                                                            <span className="text-purple-400 block uppercase font-bold">{t('foundationSign') || 'Foundation (Sign)'}</span>
                                                            <span className="text-white font-bold">{t(houseInfo?.naturalSign) || houseInfo?.naturalSign}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-400 block uppercase font-bold">{t('placementRule') || 'Placement Rule'}</span>
                                                            <span className="text-gray-200 leading-tight block">{language === 'ne' ? (houseInfo?.exaltationDetailNp || houseInfo?.exaltationDetail) : houseInfo?.exaltationDetail}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {remedyInfo.good && (
                                                    <div className="bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                                                        <h5 className="text-[10px] uppercase font-black text-green-500 mb-1">{t('goodEffects') || "Positive Effects"}</h5>
                                                        <p className="text-xs text-gray-300 leading-relaxed font-normal">
                                                            {language === 'ne' ? (remedyInfo.goodNp || remedyInfo.good) : remedyInfo.good}
                                                        </p>
                                                    </div>
                                                )}

                                                {remedyInfo.bad && (
                                                    <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                                                        <h5 className="text-[10px] uppercase font-black text-red-500 mb-1">{t('badEffects') || "Negative Effects"}</h5>
                                                        <p className="text-xs text-gray-300 leading-relaxed font-normal">
                                                            {language === 'ne' ? (remedyInfo.badNp || remedyInfo.bad) : remedyInfo.bad}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="pt-2 border-t border-white/5">
                                                    <h5 className="text-[10px] uppercase font-black text-purple-400 mb-2 flex items-center gap-2">
                                                        <span>🛡️</span> {t('remedy') || "Remedy"}
                                                    </h5>
                                                    <p className="text-xs text-white leading-relaxed font-bold italic">
                                                        "{language === 'ne' ? (remedyInfo.remediesNp || remedyInfo.remedies) : remedyInfo.remedies}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'remedies' && (
                        <div className="space-y-8">



                            {/* Personalized Remedies Logic */}
                            {(() => {
                                // 1. Setup Data & Logic
                                const analysis = analysisData?.analysis || {};
                                const { doshas = [], planets: analysisPlanets = {} } = analysis;
                                const dashaInfo = dynamicDasha?.vimshottari || analysis.dasha?.vimshottari;

                                // 2. Identify Key Planets
                                const ascSign = analysis.ascendant?.sign || analysisData.kundaliData['Ascendant']?.sign;
                                const ascLords = {
                                    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
                                    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
                                    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter',
                                    'Mesha': 'Mars', 'Vrishabha': 'Venus', 'Mithuna': 'Mercury', 'Karka': 'Moon',
                                    'Simha': 'Sun', 'Kanya': 'Mercury', 'Tula': 'Venus', 'Vrishchika': 'Mars',
                                    'Dhanu': 'Jupiter', 'Makara': 'Saturn', 'Kumbha': 'Saturn', 'Meena': 'Jupiter'
                                };
                                const ascLord = ascLords[ascSign] || (analysis.ascendant?.sign ? ascLords[analysis.ascendant.sign] : 'Sun');
                                const currentDashaLord = dynamicDasha?.vimshottari?.active?.planet || dynamicDasha?.vimshottari?.mahadasha?.lord;

                                const getPlanetRemedy = (planetName) => {
                                    if (!planetName) return null;
                                    const rawPlanet = analysisData.kundaliData[planetName] || analysisData.kundaliData[planetName.toLowerCase()];
                                    const aPlanet = analysisPlanets[planetName] || analysisPlanets[planetName.toLowerCase()];
                                    const planetData = aPlanet || rawPlanet;
                                    if (!planetData) return null;
                                    const house = planetData.house || planetData.bhav || rawPlanet?.house;
                                    const info = PlanetaryData[planetName]?.[String(house)];
                                    if (!info) return null;
                                    return {
                                        planet: planetName,
                                        house,
                                        remedyText: language === 'ne' ? (info.remediesNp || info.remedies) : info.remedies,
                                        analysisText: language === 'ne' ? (info.badNp || info.bad) : info.bad
                                    };
                                }

                                const mdLord = dashaInfo?.active?.planet || dashaInfo?.mahadasha?.lord;
                                const adLord = dashaInfo?.active?.antardasha || dashaInfo?.antardasha?.lord;
                                const mdRemedy = mdLord ? getPlanetRemedy(mdLord) : null;
                                const adRemedy = adLord && adLord !== mdLord ? getPlanetRemedy(adLord) : null;
                                const activeDoshas = (doshas || []).filter(d => d.status === "Present");

                                const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

                                const allRemedies = planets.map(planet => {
                                    const data = getPlanetRemedy(planet);
                                    if (!data) return null;
                                    // Compatibility return for now
                                    return {
                                        planet,
                                        house: data.house,
                                        analysisText: data.analysisText,
                                        remedyText: data.remedyText,
                                        isAscLord: false,
                                        isDashaLord: false
                                    };
                                }).filter(Boolean);

                                return (
                                    <div className="space-y-8">
                                        {/* Section 1: Current Dasha Cycle (Time-based Remedies) */}
                                        {(mdRemedy || adRemedy) && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <span className="text-purple-400">⏳</span> {t('currentDashaCycle') || 'Current Dasha Cycle'}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {mdRemedy && (
                                                        <div className={`p-5 rounded-xl ${currentTheme.colors.surface} border border-purple-500/30 relative overflow-hidden`}>
                                                            <div className="absolute top-0 right-0 p-2 bg-purple-500/20 rounded-bl-xl text-[10px] font-bold text-purple-300 uppercase">
                                                                {t('mahadashaMajor') || 'Mahadasha (Major)'}
                                                            </div>
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">
                                                                    {mdRemedy.planet.substring(0, 2)}
                                                                </div>
                                                                <h4 className="font-bold text-white">{t(mdRemedy.planet) || mdRemedy.planet}</h4>
                                                            </div>
                                                            <p className="text-xs text-gray-300 italic mb-2">"{mdRemedy.analysisText}"</p>
                                                            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/10">
                                                                <p className="text-sm font-medium text-purple-100">{mdRemedy.remedyText}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {adRemedy && (
                                                        <div className={`p-5 rounded-xl ${currentTheme.colors.surface} border border-blue-500/30 relative overflow-hidden`}>
                                                            <div className="absolute top-0 right-0 p-2 bg-blue-500/20 rounded-bl-xl text-[10px] font-bold text-blue-300 uppercase">
                                                                {t('antardashaSub') || 'Antardasha (Sub)'}
                                                            </div>
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
                                                                    {adRemedy.planet.substring(0, 2)}
                                                                </div>
                                                                <h4 className="font-bold text-white">{t(adRemedy.planet) || adRemedy.planet}</h4>
                                                            </div>
                                                            <p className="text-xs text-gray-300 italic mb-2">"{adRemedy.analysisText}"</p>
                                                            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/10">
                                                                <p className="text-sm font-medium text-blue-100">{adRemedy.remedyText}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Section 2: Doshas (Permanent Afflictions) */}
                                        {activeDoshas.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <span className="text-orange-400">⚠️</span> {t('activeDoshasAfflictions') || 'Active Doshas & Afflictions'}
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {activeDoshas.map((dosha, idx) => (
                                                        <div key={idx} className={`p-5 rounded-xl ${currentTheme.colors.surface} border border-orange-500/30`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-orange-200 text-lg">{t(dosha.name) || dosha.name}</h4>
                                                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase rounded">{t('present') || 'Present'}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-400 mb-3">{language === 'ne' ? dosha.descriptionNp : dosha.description}</p>

                                                            {((language === 'ne' ? dosha.remediesNp : dosha.remedies) || []).length > 0 && (
                                                                <div className="mt-3">
                                                                    <h5 className="text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">{t('suggestedRemedy')}:</h5>
                                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {(language === 'ne' ? dosha.remediesNp : dosha.remedies).map((r, i) => (
                                                                            <li key={i} className="flex items-center gap-2 text-sm text-orange-100 bg-orange-500/10 px-3 py-2 rounded-lg">
                                                                                <span className="text-orange-500">✦</span> {r}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Section 3: All Planetary Alignments */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <span className="text-blue-400">🪐</span> {t('planetaryRemedies') || 'Planetary Alignments & Remedies'}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-6">
                                                {allRemedies.map((item, idx) => (
                                                    <div key={idx} className={`p-6 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300`}>
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white bg-white/10`}>
                                                                    {item.planet.substring(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-white">
                                                                        {t(item.planet) || item.planet}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-400">
                                                                        {t('house')} {language === 'ne' ? toNepaliNumerals(item.house) : item.house}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h5 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                                                    <span className="text-orange-400">⚠</span> {t('precautionsAnalysis')}
                                                                </h5>
                                                                <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-orange-500/30 pl-3">
                                                                    "{item.analysisText}"
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                                                    <span className="text-purple-400">✦</span> {t('suggestedRemedy')}
                                                                </h5>
                                                                <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/10">
                                                                    <p className="text-sm text-white leading-relaxed font-medium">
                                                                        {item.remedyText}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'china' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <div className="text-center space-y-6 h-full">
                                <h3 className={`text-2xl font-black ${currentTheme.colors.text} flex items-center justify-center gap-3`}>
                                    <span className="text-purple-500">📜</span> {t('china')}
                                </h3>

                                <div className="w-full h-[800px] max-w-4xl mx-auto p-2 bg-white rounded-xl shadow-2xl overflow-hidden">
                                    {pdfUrl ? (
                                        <iframe
                                            src={pdfUrl}
                                            className="w-full h-full border-none rounded-lg"
                                            title="Kundli PDF"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                            <span className="ml-3 text-gray-500">Generating PDF...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div >

            {/* Remedy Details Modal */}
            {
                activeRemedy && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setActiveRemedy(null)}
                    >
                        <div
                            className={`relative w-full max-w-lg bg-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>

                            <div className="p-8 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">
                                            {language === 'ne' ? (activeRemedy.titleNp || t(activeRemedy.title) || activeRemedy.title) : activeRemedy.title}
                                        </h2>
                                        <div className="h-1 w-12 bg-purple-500 rounded-full mt-2"></div>
                                    </div>
                                    <button
                                        onClick={() => setActiveRemedy(null)}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                    <div>
                                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2 opacity-70">{t('significance')}</h4>
                                        <p className="text-gray-200 leading-relaxed text-sm font-medium">
                                            {language === 'ne' && activeRemedy.significanceNp ? activeRemedy.significanceNp : activeRemedy.significance}
                                        </p>
                                    </div>

                                    {activeRemedy.procedure && (
                                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2 opacity-70">{t('implementationGuide')}</h4>
                                            <p className="text-gray-300 leading-relaxed text-sm">
                                                {language === 'ne' && activeRemedy.procedureNp ? activeRemedy.procedureNp : activeRemedy.procedure}
                                            </p>
                                        </div>
                                    )}

                                    {activeRemedy.mantra && (
                                        <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2 opacity-70">{t('sacredMantra')}</h4>
                                            <p className="text-purple-100 font-bold italic text-center leading-relaxed text-base py-2">
                                                "{language === 'ne' && activeRemedy.mantraNp ? activeRemedy.mantraNp : activeRemedy.mantra}"
                                            </p>
                                        </div>
                                    )}

                                    {activeRemedy.benefits && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2 opacity-70">{t('resultsBenefits')}</h4>
                                            <p className="text-gray-300 leading-relaxed text-sm">
                                                {language === 'ne' && activeRemedy.benefitsNp ? activeRemedy.benefitsNp : activeRemedy.benefits}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={() => setActiveRemedy(null)}
                                        className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-[0.98]"
                                    >
                                        {t('dismiss')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* HOUSE ANALYSIS MODAL - PREMIUM UI */}
            {selectedHouse && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-24 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedHouse(null)}>
                    <div
                        className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10"
                        style={{ backgroundColor: '#09090b', opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Premium Gradient Background Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-white/20 flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-purple-900/20 via-purple-900/5 to-transparent z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xl font-black text-white border border-white/10 shadow-inner">
                                        {selectedHouse.house}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">
                                            {t('houseAnalysis')} {selectedHouse.house}
                                        </h2>
                                        <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mt-1">
                                            {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][selectedHouse.sign - 1]
                                                ? (language === 'ne' ? `${t(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][selectedHouse.sign - 1])}मा` : `In ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][selectedHouse.sign - 1]}`)
                                                : (t('unknownSign') || 'Unknown Sign')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedHouse(null)}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto pr-2">

                                {/* House Significance */}
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        {t('domainOfLife') || 'DOMAIN OF LIFE'}
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed text-sm font-medium">
                                        {language === 'ne'
                                            ? (HouseDetails[selectedHouse.house]?.descriptionNp || HouseDetails[selectedHouse.house]?.description || "General detailed analysis of this house.")
                                            : (HouseDetails[selectedHouse.house]?.description || "General detailed analysis of this house.")}
                                    </p>
                                </div>

                                {/* Planetary Analysis */}
                                <div>
                                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">
                                        {t('planetaryInfluence') || 'PLANETARY INFLUENCE'}
                                    </h4>

                                    {selectedHouse.planets && selectedHouse.planets.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedHouse.planets.map((planet, idx) => {
                                                const shortToFull = {
                                                    'सू': 'Sun', 'Su': 'Sun', 'Sun': 'Sun',
                                                    'चं': 'Moon', 'Mo': 'Moon', 'Moon': 'Moon',
                                                    'मं': 'Mars', 'Ma': 'Mars', 'Mars': 'Mars',
                                                    'बु': 'Mercury', 'Me': 'Mercury', 'Mercury': 'Mercury',
                                                    'गु': 'Jupiter', 'Ju': 'Jupiter', 'Jupiter': 'Jupiter',
                                                    'शु': 'Venus', 'Ve': 'Venus', 'Venus': 'Venus',
                                                    'श': 'Saturn', 'Sa': 'Saturn', 'Saturn': 'Saturn',
                                                    'रा': 'Rahu', 'Ra': 'Rahu', 'Rahu': 'Rahu',
                                                    'के': 'Ketu', 'Ke': 'Ketu', 'Ketu': 'Ketu',
                                                    'ल': 'Ascendant'
                                                };
                                                const fullName = shortToFull[planet.name] || planet.name;

                                                // Skip Ascendant for planetary analysis
                                                if (fullName === 'Ascendant') return (
                                                    <div key={idx} className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50">
                                                        <p className="font-bold text-white text-sm">{t('targetYou') || 'Target (You)'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{t('risingSignCoreIdentity') || 'This is your Rising Sign, the core of your identity.'}</p>
                                                    </div>
                                                );

                                                const info = PlanetaryData[fullName]?.[String(selectedHouse.house)];

                                                return (
                                                    <div key={idx} className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors group">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="font-bold text-white text-lg">{t(fullName) || fullName}</span>
                                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
                                                                {language === 'ne' ? toNepaliNumerals(planet.degree?.toFixed(2)) : planet.degree?.toFixed(2)}°
                                                            </span>
                                                        </div>

                                                        {info ? (
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <span className="text-green-400 font-bold text-xs uppercase tracking-wider block mb-1">{t('positives') || 'Positives'}</span>
                                                                    <p className="text-gray-300 text-sm leading-relaxed">{language === 'ne' ? (Array.isArray(info.goodNp) ? info.goodNp.join('. ') : (info.goodNp || (Array.isArray(info.good) ? info.good.join('. ') : info.good))) : (Array.isArray(info.good) ? info.good.join('. ') : info.good)}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-red-400 font-bold text-xs uppercase tracking-wider block mb-1">{t('challenges') || 'Challenges'}</span>
                                                                    <p className="text-gray-300 text-sm leading-relaxed">{language === 'ne' ? (Array.isArray(info.badNp) ? info.badNp.join('. ') : (info.badNp || (Array.isArray(info.bad) ? info.bad.join('. ') : info.bad))) : (Array.isArray(info.bad) ? info.bad.join('. ') : info.bad)}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 italic">{t('genericInfluence', { planet: fullName }) || `Generic influence of ${fullName} in this house.`}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                                            <p className="text-sm text-gray-400 font-medium">{t('emptyHouse') || 'Empty House'}</p>
                                            <p className="text-xs text-gray-600 mt-1">{t('influencedBySignLord') || 'This area of life is influenced by the sign lord.'}</p>
                                        </div>
                                    )}
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
