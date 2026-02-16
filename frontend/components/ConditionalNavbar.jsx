'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Hide Navbar on all admin and guru routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/guru')) {
        return null;
    }

    return <Navbar />;
}
