'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalBackground({ children }) {
    const pathname = usePathname();

    // Hide cosmic background on admin and guru routes to prevent "flash" or incorrect theme
    const isIsolated = pathname?.startsWith('/admin') || pathname?.startsWith('/guru');

    return (
        <div className={isIsolated ? "min-h-screen bg-slate-50" : "cosmic-theme-wrapper"}>
            {children}
        </div>
    );
}
