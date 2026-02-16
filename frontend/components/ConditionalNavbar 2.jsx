'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Hide Navbar on all admin, guru routes, and login page
    if (pathname === '/login' || pathname?.startsWith('/admin') || pathname?.startsWith('/guru')) {
        return null;
    }

    return <Navbar />;
}
