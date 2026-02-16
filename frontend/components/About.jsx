"use client";

import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "./Footer";

export default function About() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  return (
    <div className="min-h-screen pt-20">

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
                {t('missionTitle')}
              </h2>
              <p className={`${currentTheme.colors.textSecondary} text-lg leading-relaxed mb-6`}>
                {t('missionDescription')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    ✦
                  </div>
                  <div>
                    <h3 className={`${currentTheme.colors.text} font-semibold mb-2`}>{t('missionPoint1')}</h3>
                    <p className={currentTheme.colors.textSecondary}>{t('missionPoint1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    ☀
                  </div>
                  <div>
                    <h3 className={`${currentTheme.colors.text} font-semibold mb-2`}>{t('missionPoint2')}</h3>
                    <p className={currentTheme.colors.textSecondary}>{t('missionPoint2Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                    ✨
                  </div>
                  <div>
                    <h3 className={`${currentTheme.colors.text} font-semibold mb-2`}>{t('missionPoint3')}</h3>
                    <p className={currentTheme.colors.textSecondary}>{t('missionPoint3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/about1.webp"
                  alt="Astrology and cosmic wisdom"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
              {t('valuesTitle')}
            </h2>
            <p className={`${currentTheme.colors.textSecondary} text-lg max-w-3xl mx-auto`}>
              {t('valuesSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`text-center p-8 rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur`}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl">
                🔮
              </div>
              <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4`}>{t('value1Title')}</h3>
              <p className={currentTheme.colors.textSecondary}>{t('value1Desc')}</p>
            </div>
            
            <div className={`text-center p-8 rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur`}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl">
                🌟
              </div>
              <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4`}>{t('value2Title')}</h3>
              <p className={currentTheme.colors.textSecondary}>{t('value2Desc')}</p>
            </div>
            
            <div className={`text-center p-8 rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur`}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl">
                🌙
              </div>
              <h3 className={`text-xl font-bold ${currentTheme.colors.text} mb-4`}>{t('value3Title')}</h3>
              <p className={currentTheme.colors.textSecondary}>{t('value3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Images Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
              {t('spiritualJourney')}
            </h2>
            <p className={`${currentTheme.colors.textSecondary} text-lg max-w-3xl mx-auto`}>
              {t('spiritualJourneyDesc')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/about2.jpg"
                  alt="Spiritual journey and cosmic wisdom"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/om.webp"
                  alt="Sacred Om symbol"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur p-12 text-center`}>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
              {t('aboutCtaTitle')}
            </h2>
            <p className={`${currentTheme.colors.textSecondary} text-lg mb-8 max-w-2xl mx-auto`}>
              {t('aboutCtaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/(sections)/chat" className="btn-brand">
                {t('startChat')}
              </a>
              <a href="/(sections)/kundli" className="btn-brand-alt">
                {t('generateKundli')}
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
