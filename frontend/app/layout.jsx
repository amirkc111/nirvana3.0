import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WeatherProvider } from "@/contexts/WeatherContext";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MobileBottomNav from "@/components/MobileBottomNav";
import ConditionalChatWidget from "@/components/ConditionalChatWidget";
import ConditionalBackground from "@/components/ConditionalBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Nirvana Astro",
    description: "Your Cosmic Guide",
    icons: {
        icon: "/an.png",
        shortcut: "/an.png",
        apple: "/an.png",
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={inter.className}>
                <ThemeProvider>
                    <LanguageProvider>
                        <WeatherProvider>
                            <AnnouncementBanner />
                            <ConditionalNavbar />
                            <ConditionalBackground>
                                <div className="pb-40 md:pb-0">
                                    {children}
                                </div>
                            </ConditionalBackground>
                            <MobileBottomNav />
                            <ConditionalChatWidget />
                        </WeatherProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
