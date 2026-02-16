"use client";

import Hero from "../components/Hero";
import Footer from "../components/Footer";
import ZodiacGrid from "../components/ZodiacGrid";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <ZodiacGrid />
      <Footer />
    </main>
  );
}
