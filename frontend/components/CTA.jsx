"use client";

import SectionHeading from "./SectionHeading";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

export default function CTA() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur p-10 text-center`}>
          <SectionHeading title={t('ctaTitle')} subtitle={t('ctaSubtitle')} />
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => {
                // Open chat widget by finding the chat button
                const chatButton = document.querySelector('button[class*="w-16 h-16 rounded-full"]');
                if (chatButton) {
                  chatButton.click();
                } else {
                  // Fallback: try to find any button with the logo
                  const logoButton = document.querySelector('button img[alt="Chat with Nirvana Astro"]')?.closest('button');
                  if (logoButton) {
                    logoButton.click();
                  } else {
                    console.log('Chat widget not found');
                  }
                }
              }}
              className="px-6 py-3 bg-purple-900/80 backdrop-blur-sm border border-purple-700/50 text-white font-medium rounded-lg hover:bg-purple-800/90 hover:border-purple-600/70 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>💬</span>
              <span>{t('startChat')}</span>
            </button>
            <a 
              href="/kundli" 
              className="px-6 py-3 bg-indigo-900/80 backdrop-blur-sm border border-indigo-700/50 text-white font-medium rounded-lg hover:bg-indigo-800/90 hover:border-indigo-600/70 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>🕉️</span>
              <span>{t('generateKundli')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


