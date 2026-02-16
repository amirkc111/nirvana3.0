import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toNepaliNumerals } from '../lib/vedicjyotish/services/NepaliLocalization';

const StrengthAnalysis = ({ shadbala, ashtakavarga, rashiBala, muhurta }) => {
    const { currentTheme } = useTheme();
    const { t, language } = useLanguage();

    if (!shadbala || !ashtakavarga || !rashiBala) {
        return (
            <div className={`p-8 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border} text-center`}>
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className={`text-xl font-bold ${currentTheme.colors.text}`}>{t('strengthDataMissing') || 'Strength Data Not Available'}</h3>
                <p className={`text-sm ${currentTheme.colors.textSecondary} mt-2`}>
                    {t('pleaseRefreshRecalculate') || 'Please refresh the page to recalculate the chart data.'}
                </p>
                <div className="mt-4 text-xs text-gray-500 font-mono">
                    Missing:
                    {!shadbala ? ' Shadbala' : ''}
                    {!ashtakavarga ? ' Ashtakavarga' : ''}
                    {!rashiBala ? ' RashiBala' : ''}
                </div>
            </div>
        );
    }

    // Helper to sort planets by strength
    const sortedShadbala = Object.entries(shadbala)
        .sort(([, a], [, b]) => b.total - a.total);

    const signs = [
        t('Aries') || "Aries", t('Taurus') || "Taurus", t('Gemini') || "Gemini", t('Cancer') || "Cancer",
        t('Leo') || "Leo", t('Virgo') || "Virgo", t('Libra') || "Libra", t('Scorpio') || "Scorpio",
        t('Sagittarius') || "Sagittarius", t('Capricorn') || "Capricorn", t('Aquarius') || "Aquarius", t('Pisces') || "Pisces"
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-500">

            {/* 1. SHADBALA SECTION */}
            <div className={`p-6 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border}`}>
                <h3 className={`text-xl font-black ${currentTheme.colors.text} mb-6 flex items-center gap-2`}>
                    <span className="text-yellow-500">💪</span> {t('shadbalaTitle') || 'Shadbala (Planetary Strength)'}
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-black/20 text-gray-400">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">{t('planet')}</th>
                                <th className="px-4 py-3">{t('totalUnits') || 'Total (Rupas)'}</th>
                                <th className="px-4 py-3">{t('positional') || 'Positional'}</th>
                                <th className="px-4 py-3">{t('directional') || 'Directional'}</th>
                                <th className="px-4 py-3">{t('temporal') || 'Temporal'}</th>
                                <th className="px-4 py-3">{t('motional') || 'Motional'}</th>
                                <th className="px-4 py-3">{t('natural') || 'Natural'}</th>
                                <th className="px-4 py-3 rounded-r-lg">{t('rank') || 'Rank'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedShadbala.map(([planet, data], index) => (
                                <tr key={planet} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className={`px-4 py-3 font-bold ${currentTheme.colors.text}`}>{t(planet) || planet}</td>
                                    <td className="px-4 py-3 font-mono text-yellow-400 font-bold">{language === 'ne' ? toNepaliNumerals(data.rupas) : data.rupas}</td>
                                    <td className="px-4 py-3 text-gray-400">{language === 'ne' ? toNepaliNumerals(data.sthana) : data.sthana}</td>
                                    <td className="px-4 py-3 text-gray-400">{language === 'ne' ? toNepaliNumerals(data.dig) : data.dig}</td>
                                    <td className="px-4 py-3 text-gray-400">{language === 'ne' ? toNepaliNumerals(data.kala) : data.kala}</td>
                                    <td className="px-4 py-3 text-gray-400">{language === 'ne' ? toNepaliNumerals(data.chesta) : data.chesta}</td>
                                    <td className="px-4 py-3 text-gray-400">{language === 'ne' ? toNepaliNumerals(data.naisargika) : data.naisargika}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold 
                                            ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                                index === 6 ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                                    'bg-gray-700 text-gray-300'}`}>
                                            {language === 'ne' ? toNepaliNumerals(index + 1) : index + 1}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. ASHTAKAVARGA SECTION */}
            <div className={`p-6 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border}`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-black ${currentTheme.colors.text} flex items-center gap-2`}>
                        <span className="text-blue-500">🕸️</span> {t('ashtakavargaTitle') || 'Ashtakavarga'}
                    </h3>
                </div>

                {/* Sarvashtakavarga Chart */}
                <div className="mb-8">
                    <h4 className={`text-sm font-bold ${currentTheme.colors.textSecondary} mb-4 uppercase tracking-widest`}>{t('sarvashtakavargaTitle') || 'Sarvashtakavarga (Total Points)'}</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                        {ashtakavarga.sarvashtakavarga.map((score, index) => (
                            <div key={index} className={`relative p-3 rounded-xl border ${currentTheme.colors.border} flex flex-col items-center justify-center gap-1
                                        ${score >= 30 ? 'bg-green-500/10 border-green-500/30' : score < 25 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5'}`}>
                                <span className="text-[10px] text-gray-500 uppercase font-black">{signs[index].substring(0, 3)}</span>
                                <span className={`text-xl font-black ${score >= 28 ? 'text-white' : 'text-gray-400'}`}>{language === 'ne' ? toNepaliNumerals(score) : score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bhinnashtakavarga Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center">
                        <thead className="text-xs uppercase bg-black/20 text-gray-400">
                            <tr>
                                <th className="px-2 py-2 text-left rounded-l-lg">{t('planet')}</th>
                                {signs.map(s => <th key={s} className="px-2 py-2">{s.substring(0, 3)}</th>)}
                                <th className="px-2 py-2 rounded-r-lg">{t('total')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(ashtakavarga.bhinnashtakavarga).map(([planet, scores]) => (
                                <tr key={planet} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className={`px-2 py-2 font-bold text-left ${currentTheme.colors.text}`}>{t(planet) || planet}</td>
                                    {scores.map((score, i) => (
                                        <td key={i} className={`px-2 py-2 ${score >= 5 ? 'text-green-400 font-bold' : score <= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {language === 'ne' ? toNepaliNumerals(score) : score}
                                        </td>
                                    ))}
                                    <td className="px-2 py-2 font-bold text-yellow-500">{language === 'ne' ? toNepaliNumerals(scores.reduce((a, b) => a + b, 0)) : scores.reduce((a, b) => a + b, 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. RASHI BALA SECTION */}
            <div className={`p-6 rounded-2xl ${currentTheme.colors.surface} border ${currentTheme.colors.border}`}>
                <h3 className={`text-xl font-black ${currentTheme.colors.text} mb-6 flex items-center gap-2`}>
                    <span className="text-purple-500">⚖️</span> {t('rashiBalaTitle')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(rashiBala).map(([signIndex, strength]) => {
                        const index = parseInt(signIndex) - 1; // map 1-based index to 0-based array
                        return (
                            <div key={signIndex} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl opacity-50">{/* Icon placeholder */}</div>
                                    <div>
                                        <p className={`font-bold ${currentTheme.colors.text}`}>{signs[index]}</p>
                                        <p className="text-xs text-gray-500">{t('house')} {language === 'ne' ? toNepaliNumerals(signIndex) : signIndex}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-mono font-bold text-purple-400">{language === 'ne' ? toNepaliNumerals(strength) : strength}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{t('shashtiamsas') || 'Shashtiamsas'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* 5. Muhurta & Hora Analysis */}
            {muhurta && (
                <div className="space-y-6">
                    <h4 className={`text-xl font-bold ${currentTheme.colors.text} flex items-center gap-2 mb-4`}>
                        <span className="text-blue-500">⏳</span> {t('muhurtaHora')}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Current Hora Card */}
                        <div className={`p-6 rounded-2xl border ${currentTheme.colors.border} bg-white/5`}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className={`font-bold ${currentTheme.colors.textSecondary} uppercase tracking-wider text-xs`}>
                                    {t('currentHora')}
                                </h4>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${muhurta.hora?.type.includes('Day') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {muhurta.hora?.type}
                                </span>
                            </div>

                            <div className="text-center py-4">
                                <div className="text-4xl font-black text-white mb-2">{t(muhurta.hora?.lord) || muhurta.hora?.lord}</div>
                                <div className={`text-sm ${currentTheme.colors.textSecondary}`}>
                                    {muhurta.hora?.startTime} - {muhurta.hora?.endTime}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                                <span className="text-gray-500">{t('duration') || 'Duration'}: {language === 'ne' ? toNepaliNumerals(muhurta.hora?.durationMins) : muhurta.hora?.durationMins} {t('mins') || 'mins'}</span>
                                <span className="text-green-400 font-bold">{language === 'ne' ? toNepaliNumerals(muhurta.hora?.remainingMinutes) : muhurta.hora?.remainingMinutes} {t('minRemaining') || 'min remaining'}</span>
                            </div>
                        </div>

                        {/* Daily Muhurta Grid */}
                        <div className={`p-6 rounded-2xl border ${currentTheme.colors.border} bg-white/5`}>
                            <h4 className={`font-bold ${currentTheme.colors.textSecondary} uppercase tracking-wider text-xs mb-4`}>
                                {t('inauspiciousPeriods')}
                            </h4>
                            <div className="space-y-3">
                                {muhurta.rahu_kalam && (
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-400 text-lg">⚠️</span>
                                            <div>
                                                <p className="font-bold text-red-300 text-sm">{t('rahuKalam') || 'Rahu Kalam'}</p>
                                                <p className="text-[10px] text-red-400/70">{t('rahuKalamDesc') || 'Mental confusion & setbacks'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-red-200 text-sm">
                                                {muhurta.rahu_kalam.start} - {muhurta.rahu_kalam.end}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {muhurta.kalavelas?.day_kalavelas?.yamaganda && (
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-orange-400 text-lg">🚫</span>
                                            <div>
                                                <p className="font-bold text-orange-300 text-sm">{t('yamaganda') || 'Yamaganda'}</p>
                                                <p className="text-[10px] text-orange-400/70">{t('yamagandaDesc') || 'Failure & loss'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-orange-200 text-sm">
                                                {muhurta.kalavelas.day_kalavelas.yamaganda.start} - {muhurta.kalavelas.day_kalavelas.yamaganda.end}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {muhurta.kalavelas?.day_kalavelas?.gulika && (
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-500/10 border border-orange-500/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-400 text-lg">🐢</span>
                                            <div>
                                                <p className="font-bold text-yellow-300 text-sm">{t('gulikaKaal') || 'Gulika Kaal'}</p>
                                                <p className="text-[10px] text-yellow-400/70">{t('gulikaKaalDesc') || 'Repeating Events'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-yellow-200 text-sm">
                                                {muhurta.kalavelas.day_kalavelas.gulika.start} - {muhurta.kalavelas.day_kalavelas.gulika.end}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrengthAnalysis;
