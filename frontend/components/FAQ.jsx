"use client";

import { useLanguage } from "../contexts/LanguageContext";
import Footer from "./Footer";

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('faq1Question'),
      answer: t('faq1Answer')
    },
    {
      question: t('faq2Question'),
      answer: t('faq2Answer')
    },
    {
      question: t('faq3Question'),
      answer: t('faq3Answer')
    },
    {
      question: t('faq4Question'),
      answer: t('faq4Answer')
    },
    {
      question: t('faq5Question'),
      answer: t('faq5Answer')
    },
    {
      question: t('faq6Question'),
      answer: t('faq6Answer')
    },
    {
      question: t('faq7Question'),
      answer: t('faq7Answer')
    },
    {
      question: t('faq8Question'),
      answer: t('faq8Answer')
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6" style={{ color: "var(--brand-soft)" }}>
              {t('faqTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('faqSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="text-xl font-bold text-white mb-4">{faq.question}</h3>
                <p className="text-white/80 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: "var(--brand-soft)" }}>
              {t('stillNeedHelp')}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              {t('contactSupportDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-brand">
                {t('contactUs')}
              </a>
              <a href="/help-center" className="btn-brand-alt">
                {t('helpCenter')}
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
