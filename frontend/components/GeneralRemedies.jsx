"use client";

import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function GeneralRemedies() {
    const { t, language } = useLanguage();
    const { currentTheme } = useTheme();

    // Universal Remedies Data (Can be moved to JSON later)
    const generalRemedies = [
        {
            planet: 'Sun',
            planetNp: 'सूर्य',
            icon: '☀️',
            color: 'from-orange-400 to-red-500',
            mantra: 'Om Hram Hreem Hroum Sah Suryaya Namah',
            mantraNp: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
            remedy: 'Offer water to the rising Sun. Respect your father and elders.',
            remedyNp: 'उदाउँदो सूर्यलाई अर्घ्य दिनुहोस्। बुबा र मान्यजनको आदर गर्नुहोस्।'
        },
        {
            planet: 'Moon',
            planetNp: 'चन्द्र',
            icon: '🌙',
            color: 'from-gray-300 to-white',
            mantra: 'Om Shram Shreem Shroum Sah Chandraya Namah',
            mantraNp: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
            remedy: 'Meditate daily. Respect your mother and offer white flowers to Lord Shiva.',
            remedyNp: 'दिनहुँ ध्यान गर्नुहोस्। आमाको आदर गर्नुहोस् र भगवान शिवलाई सेतो फूल चढाउनुहोस्।'
        },
        {
            planet: 'Mars',
            planetNp: 'मंगल',
            icon: '🔥',
            color: 'from-red-500 to-orange-600',
            mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah',
            mantraNp: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
            remedy: 'Recite Hanuman Chalisa. Donate red lentils (Masoor Dal) on Tuesdays.',
            remedyNp: 'हनुमान चालिसा पाठ गर्नुहोस्। मंगलबार मुसुरोको दाल दान गर्नुहोस्।'
        },
        {
            planet: 'Mercury',
            planetNp: 'बुध',
            icon: '☿️',
            color: 'from-green-400 to-emerald-600',
            mantra: 'Om Bram Breem Broum Sah Budhaya Namah',
            mantraNp: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
            remedy: 'Worship Lord Ganesha. Feed green grass to cows.',
            remedyNp: 'भगवान गणेशको पूजा गर्नुहोस्। गाईलाई हरियो घाँस खुवाउनुहोस्।'
        },
        {
            planet: 'Jupiter',
            planetNp: 'बृहस्पति',
            icon: '✨',
            color: 'from-yellow-400 to-amber-500',
            mantra: 'Om Gram Greem Groum Sah Gurave Namah',
            mantraNp: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
            remedy: 'Respect teachers and Brahmins. Apply saffron Tilak on forehead.',
            remedyNp: 'गुरु र ब्राह्मणहरूको आदर गर्नुहोस्। निधारमा केसरको तिलक लगाउनुहोस्।'
        },
        {
            planet: 'Venus',
            planetNp: 'शुक्र',
            icon: '💎',
            color: 'from-pink-400 to-rose-500',
            mantra: 'Om Dram Dreem Droum Sah Shukraya Namah',
            mantraNp: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
            remedy: 'Respect women. Keep yourself and your surroundings clean and fragrant.',
            remedyNp: 'महिलाहरूको सम्मान गर्नुहोस्। आफू र आफ्नो वरपर सफा र सुगन्धित राख्नुहोस्।'
        },
        {
            planet: 'Saturn',
            planetNp: 'शनि',
            icon: '🪐',
            color: 'from-indigo-600 to-blue-800',
            mantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah',
            mantraNp: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
            remedy: 'Help the poor and needy. Recite Shani Stotra on Saturdays.',
            remedyNp: 'गरिब र दुखीहरूलाई मद्दत गर्नुहोस्। शनिबार शनि स्तोत्र पाठ गर्नुहोस्।'
        },
        {
            planet: 'Rahu',
            planetNp: 'राहु',
            icon: '🌑',
            color: 'from-gray-600 to-slate-800',
            mantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namah',
            mantraNp: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
            remedy: 'Feed birds. Donate blankets to the needy.',
            remedyNp: 'चराहरूलाई दाना दिनुहोस्। न्यानो लुगा वा कम्बल दान गर्नुहोस्।'
        },
        {
            planet: 'Ketu',
            planetNp: 'केतु',
            icon: '🏳️',
            color: 'from-red-800 to-stone-800',
            mantra: 'Om Stram Streem Stroum Sah Ketave Namah',
            mantraNp: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
            remedy: 'Feed street dogs. Engage in spiritual practices.',
            remedyNp: 'सडकका कुकुरहरूलाई खाना दिनुहोस्। आध्यात्मिक अभ्यासमा संलग्न हुनुहोस्।'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className={`text-3xl font-bold ${currentTheme.colors.text} mb-4`}>
                    {language === 'ne' ? 'सामान्य ज्योतिषीय उपायहरू' : 'General Astrological Remedies'}
                </h2>
                <p className={`${currentTheme.colors.textSecondary} text-lg leading-relaxed`}>
                    {language === 'ne'
                        ? 'ग्रह शान्ति र जीवनमा सकारात्मक ऊर्जा ल्याउनका लागि केही सरल र प्रभावकारी उपायहरू। यी उपायहरू सबैका लागि लाभदायक हुन्छन्।'
                        : 'Simple and effective remedies to bring peace and positive energy into your life. These universal remedies are beneficial for everyone regardless of their chart.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalRemedies.map((item, idx) => (
                    <div
                        key={idx}
                        className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-2xl p-6 relative overflow-hidden group hover:border-opacity-50 transition-all duration-300 hover:shadow-xl`}
                    >
                        {/* Background Gradient Effect */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`}></div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg`}>
                                {item.icon}
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${currentTheme.colors.text}`}>
                                    {language === 'ne' ? item.planetNp : item.planet}
                                </h3>
                                <div className="h-1 w-8 bg-gradient-to-r from-transparent to-current opacity-30 mt-1"></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-70 ${currentTheme.colors.text}`}>
                                    {language === 'ne' ? 'बीज मन्त्र' : 'Beej Mantra'}
                                </h4>
                                <p className={`text-sm font-serif italic ${currentTheme.colors.primary} bg-primary/5 p-2 rounded-lg border border-primary/10`}>
                                    "{language === 'ne' ? item.mantraNp : item.mantra}"
                                </p>
                            </div>

                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-70 ${currentTheme.colors.text}`}>
                                    {language === 'ne' ? 'सुझाव' : 'Suggestion'}
                                </h4>
                                <p className={`text-sm ${currentTheme.colors.textSecondary} leading-relaxed`}>
                                    {language === 'ne' ? item.remedyNp : item.remedy}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`mt-8 p-6 rounded-2xl ${currentTheme.colors.surface} border border-blue-500/20 bg-blue-500/5 text-center`}>
                <p className={`text-sm ${currentTheme.colors.textSecondary}`}>
                    {language === 'ne'
                        ? 'नोट: यी सामान्य उपायहरू हुन्। विशिष्ट समस्याहरूको लागि र कुण्डली आधारित विस्तृत विश्लेषणको लागि ज्योतिषीसँग परामर्श लिन वा "कुण्डली विश्लेषण" खण्ड प्रयोग गर्न सिफारिस गरिन्छ।'
                        : 'Note: These are general remedies. For specific issues and detailed chart-based analysis, it is recommended to consult an astrologer or use the "Kundli Analysis" feature.'}
                </p>
            </div>
        </div>
    );
}
