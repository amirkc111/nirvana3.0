"use client";

import Image from "next/image";
import { useTheme } from "../contexts/ThemeContext";

export default function SectionHeading({ eyebrow, title, subtitle, showLogo = true }) {
  const { currentTheme } = useTheme();
  return (
    <div className="text-center">
      {showLogo ? (
        <div className="flex justify-center">
          <Image src="/an.png" alt="Nirvana Astro" width={32} height={32} className="rounded" />
        </div>
      ) : null}
      {eyebrow ? (
        <div className={`text-xs uppercase tracking-[0.3em] ${currentTheme.colors.textSecondary}`}>{eyebrow}</div>
      ) : null}
      <h2 className={`mt-2 text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-3 text-sm sm:text-base ${currentTheme.colors.textSecondary} max-w-2xl mx-auto`}>{subtitle}</p>
      ) : null}
    </div>
  );
}


