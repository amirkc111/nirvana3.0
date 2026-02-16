"use client";

import SectionHeading from "./SectionHeading";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const getFeatures = (t) => [
  {
    title: t('personalizedKundli'),
    desc: t('personalizedKundliDesc'),
    icon: "✦",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: t('dailyHoroscope'),
    desc: t('dailyHoroscopeDesc'),
    icon: "☀",
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: t('astroChatFeature'),
    desc: t('astroChatDesc'),
    icon: "💬",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: t('compatibility'),
    desc: t('compatibilityDesc'),
    icon: "❤",
    color: "from-red-500 to-pink-500"
  },
  {
    title: t('panchang'),
    desc: t('panchangDesc'),
    icon: "📅",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: t('remedies'),
    desc: t('remediesDesc'),
    icon: "✨",
    color: "from-indigo-500 to-purple-500"
  },
];

export default function Features() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('featuresEyebrow')}
          title={t('featuresTitle')}
          subtitle={t('featuresSubtitle')}
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFeatures(t).map((f, index) => (
            <div key={f.title} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl" 
                   style={{ background: f.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' :
                            f.color === 'from-yellow-500 to-orange-500' ? 'linear-gradient(135deg, #eab308, #f97316)' :
                            f.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                            f.color === 'from-red-500 to-pink-500' ? 'linear-gradient(135deg, #ef4444, #ec4899)' :
                            f.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(135deg, #22c55e, #10b981)' :
                            'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
              <div className={`relative rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur p-8 ${currentTheme.colors.hover} transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${f.color} flex items-center justify-center ${currentTheme.colors.text} text-xl font-bold shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className={`text-xl font-bold ${currentTheme.colors.text}`}>{f.title}</h3>
                </div>
                <p className={`${currentTheme.colors.textSecondary} leading-relaxed`}>{f.desc}</p>
                <div className={`mt-4 flex items-center text-sm ${currentTheme.colors.textSecondary} group-hover:${currentTheme.colors.text} transition-colors`}>
                  <span>{t('learnMore')}</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


