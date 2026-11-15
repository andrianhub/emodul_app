import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Nunito, Amiri } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title:
    "E-Modul SKI Kelas 4 MI Sirojul Huda — Hijrahnya Para Sahabat ke Habasyah",
  description:
    "E-Modul Interaktif Sejarah Kebudayaan Islam (SKI) Kelas 4 Semester 1 MI Sirojul Huda Kurikulum Merdeka KBC tentang Hijrahnya Para Sahabat ke Habasyah oleh Andrian Dwi Pranata, S.Pd. Dilengkapi fitur Belajar dengan Mendengarkan, Ulangan Harian 5 Uraian, dan Panel Guru.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${nunito.variable} ${amiri.variable}`}
    >
      <body className="min-h-screen bg-[#FAF7F0] text-[#1F2933] font-[family-name:var(--font-body)] antialiased selection:bg-emerald-200 selection:text-emerald-950">
        {children}
      </body>
    </html>
  );
}
