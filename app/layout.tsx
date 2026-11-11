import type { Metadata } from "next";
import { Suspense } from "react";
import { Newsreader, Instrument_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Quizly",
  description: "Write a quiz, host it live, see who knows it best.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Suspense fallback={<div className="h-16 border-b border-line" />}>
          <Nav />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}