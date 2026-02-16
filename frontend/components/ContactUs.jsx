"use client";

import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "./Footer";

export default function ContactUs() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className={`text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
                {t('contactTitle')}
              </h1>
              <p className={`text-lg sm:text-xl ${currentTheme.colors.textSecondary} max-w-3xl leading-relaxed mb-8`}>
                {t('contactSubtitle')}
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center ${currentTheme.colors.text} text-xl">
                    📧
                  </div>
                  <div>
                    <h3 className={`${currentTheme.colors.text} font-semibold`}>{t('email')}</h3>
                    <p className={`${currentTheme.colors.textSecondary}`}>info@nirvanaastro.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center ${currentTheme.colors.text} text-xl">
                    📱
                  </div>
                  <div>
                    <h3 className={`${currentTheme.colors.text} font-semibold`}>{t('phone')}</h3>
                    <p className={`${currentTheme.colors.textSecondary}`}>+977-1-1234567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center ${currentTheme.colors.text} text-xl">
                    📍
                  </div>
                  <div>
                    <h3 className={`${currentTheme.colors.text} font-semibold`}>{t('address')}</h3>
                    <p className={`${currentTheme.colors.textSecondary}`}>Kathmandu, Nepal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/shiva.jpg"
                  alt="Contact us for cosmic guidance"
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

      {/* Contact Form */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: "var(--brand-soft)" }}>
              {t('sendMessage')}
            </h2>
            <p className={`${currentTheme.colors.textSecondary} text-lg max-w-2xl mx-auto`}>
              {t('sendMessageDesc')}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${currentTheme.colors.text} font-medium mb-2`}>{t('firstName')}</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 ${currentTheme.colors.text} placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200"
                    placeholder={t('firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block ${currentTheme.colors.text} font-medium mb-2">{t('lastName')}</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 ${currentTheme.colors.text} placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200"
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block ${currentTheme.colors.text} font-medium mb-2">{t('email')}</label>
                <input
                  type="email"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 ${currentTheme.colors.text} placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200"
                  placeholder={t('emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block ${currentTheme.colors.text} font-medium mb-2">{t('subject')}</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 ${currentTheme.colors.text} placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200"
                  placeholder={t('subjectPlaceholder')}
                />
              </div>

              <div>
                <label className="block ${currentTheme.colors.text} font-medium mb-2">{t('message')}</label>
                <textarea
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 ${currentTheme.colors.text} placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200 resize-none"
                  placeholder={t('messagePlaceholder')}
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn-brand px-8 py-4 text-lg font-semibold"
                >
                  {t('sendMessage')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
