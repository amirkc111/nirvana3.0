"use client";

import { useLanguage } from "../contexts/LanguageContext";
import Footer from "./Footer";

export default function PrivacyPolicy() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6" style={{ color: "var(--brand-soft)" }}>
              {t('privacyPolicyTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('privacyPolicySubtitle')}
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
                <h2 className="text-2xl font-bold text-white mb-4">{t('informationWeCollect')}</h2>
                <p className="text-white/80 leading-relaxed mb-4">{t('informationWeCollectDesc')}</p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>{t('personalInfo')}</li>
                  <li>{t('usageData')}</li>
                  <li>{t('cookiesData')}</li>
                  <li>{t('communicationData')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('howWeUseInfo')}</h2>
                <p className="text-white/80 leading-relaxed mb-4">{t('howWeUseInfoDesc')}</p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>{t('serviceProvision')}</li>
                  <li>{t('communication')}</li>
                  <li>{t('improvement')}</li>
                  <li>{t('legalCompliance')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('dataProtection')}</h2>
                <p className="text-white/80 leading-relaxed mb-4">{t('dataProtectionDesc')}</p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>{t('encryption')}</li>
                  <li>{t('secureServers')}</li>
                  <li>{t('accessControl')}</li>
                  <li>{t('regularAudits')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('yourRights')}</h2>
                <p className="text-white/80 leading-relaxed mb-4">{t('yourRightsDesc')}</p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>{t('accessData')}</li>
                  <li>{t('correctData')}</li>
                  <li>{t('deleteData')}</li>
                  <li>{t('dataPortability')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{t('contactUs')}</h2>
                <p className="text-white/80 leading-relaxed">
                  {t('privacyContactDesc')} support@nirvanaastro.com
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
