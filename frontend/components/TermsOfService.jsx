"use client";

import { useLanguage } from "../contexts/LanguageContext";
import Footer from "./Footer";

export default function TermsOfService() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6" style={{ color: "var(--brand-soft)" }}>
              {t('termsOfServiceTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('termsOfServiceSubtitle')}
            </p>
            <p className="text-sm text-white/60 mt-4">
              {t('lastUpdated')}: {language === 'ne' ? 'पुस ९, २०८२' : 'December 24, 2025'}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('acceptanceOfTerms')}</h2>
                <p className="text-white/80 leading-relaxed">
                  {t('acceptanceOfTermsDesc')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('serviceDescription')}</h2>
                <p className="text-white/80 leading-relaxed mb-4">{t('serviceDescriptionDesc')}</p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>{t('astrologicalServices')}</li>
                  <li>{t('horoscopeReadings')}</li>
                  <li>{t('kundliAnalysis')}</li>
                  <li>{t('cosmicGuidance')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('userObligations')}</h2>
                <p className="text-white/80 leading-relaxed mb-4">{t('userObligationsDesc')}</p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>{t('accurateInfo')}</li>
                  <li>{t('respectfulUse')}</li>
                  <li>{t('noMisuse')}</li>
                  <li>{t('complianceWithLaws')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('limitationOfLiability')}</h2>
                <p className="text-white/80 leading-relaxed">
                  {t('limitationOfLiabilityDesc')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('modifications')}</h2>
                <p className="text-white/80 leading-relaxed">
                  {t('modificationsDesc')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('contactUs')}</h2>
                <p className="text-white/80 leading-relaxed">
                  {t('termsContactDesc')} support@nirvanaastro.com
                </p>
                <div className="mt-4">
                  <a href="/contact" className="btn-brand">
                    {t('contactUs')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
