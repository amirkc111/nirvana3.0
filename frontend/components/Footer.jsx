"use client";

import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeDigits } from '../utils/localization';

export default function Footer() {
  const { currentTheme } = useTheme();
  const { t, language } = useLanguage();

  return (
    <footer className={`hidden md:block py-4 mt-auto border-t ${currentTheme.colors.border} bg-[#050505]/80 backdrop-blur-md relative z-10`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-8 text-xs sm:text-sm text-gray-400">
        <Link href="/contact" className="hover:text-white transition-colors">
          {t('contactUs')}
        </Link>
        <Link href="/privacy-policy" className="hover:text-white transition-colors">
          {t('privacyPolicy')}
        </Link>
        <Link href="/terms-of-service" className="hover:text-white transition-colors">
          {t('termsOfService')}
        </Link>
        <span className="text-white/20 select-none">v{localizeDigits('3.1.0', language)}</span>
      </div>
    </footer>
  );
}
