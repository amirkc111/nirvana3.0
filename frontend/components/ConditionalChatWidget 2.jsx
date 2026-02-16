"use client";

import { usePathname } from 'next/navigation';
import EnhancedChatWidget from './EnhancedChatWidget';

export default function ConditionalChatWidget() {
    const pathname = usePathname();

    // Don't show chat on admin, guru pages, or login page
    if (pathname === '/login' || pathname?.startsWith('/admin') || pathname?.startsWith('/guru')) return null;

    return <EnhancedChatWidget />;
}