"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  GraduationCap,
  Heart,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ArrowRight,
  FileEdit,
  Compass,
  CheckCircle2,
} from "lucide-react";
import {
  MODULE_META,
  MODULE_SECTIONS,
  CLASS_OPTIONS,
} from "@/lib/module-content";
import type { StudentSessionResponse } from "@/types/emodul";

interface StudentEntryViewProps {
  onSuccess: (data: StudentSessionResponse, autoListen?: boolean) => void;
}

export function StudentEntryView({ onSuccess }: StudentEntryViewProps) {
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("Kelas 4A");
  const [absenNumber, setAbsenNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showObjectives, setShowObjectives] = useState(false);

  async function handleStart(autoListen: boolean) {
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setError("Mohon tulis nama lengkapmu terlebih dahulu ya, Nak! (minimal 2 huruf)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/students/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmed,
          className,
          absenNumber: absenNumber.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk belajar. Silakan coba lagi.");
        return;
      }

      onSuccess(data as StudentSessionResponse, autoListen);
    } catch {
      setError("Koneksi bermasalah. Pastikan internet aktif dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen parchment-dots">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#E5DCCB] bg-[#FAF7F0]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F5132] to-[#198754] text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {MODULE_META.school}
              </p>
              <p className="text-sm font-bold text-slate-900">
                E-Modul SKI Kelas 4 • Kurikulum Merdeka KBC
              </p>
            </div>
          </div>

          <Link
            href="/guru"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 shadow-xs transition hover:bg-amber-100 hover:shadow-sm sm:text-sm"
          >
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            <span>Panel Guru</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Hero Storybook Card */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/15 bg-gradient-to-br from-[#0B3D26] via-[#0F5132] to-[#15623E] text-white shadow-xl">
          <div className="islamic-pattern pointer-events-none absolute inset-0 opacity-80" />
          <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="space-y-5 lg:col-span-7">
              <p className="font-arabic text-2xl text-amber-200/95 sm:text-3xl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide text-emerald-50 backdrop-blur-xs">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
                  {MODULE_META.subject} • {MODULE_META.grade}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/40">
                  <Heart className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  {MODULE_META.curriculum}
                </span>
              </div>

              <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                {MODULE_META.title}
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
                Jelajahi kisah keteguhan iman, kesabaran, dan kasih sayang para sahabat
                Rasulullah SAW saat menyeberangi Laut Merah menuju negeri Habasyah yang
                dipimpin Raja Najasyi yang adil.
              </p>

              {/* Author & School Credit Pill */}
              <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm backdrop-blur-xs">
                <div>
                  <span className="text-emerald-200/80">Disusun oleh: </span>
                  <strong className="font-bold text-amber-200">
                    {MODULE_META.author}
                  </strong>
                </div>
                <span className="hidden text-white/30 sm:inline">•</span>
                <div>
                  <span className="text-emerald-200/80">Madrasah: </span>
                  <strong className="font-bold text-white">
                    {MODULE_META.school}
                  </strong>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-50">
                  <BookOpen className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>5 Bagian Materi Interaktif</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-50">
                  <Headphones className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>Fitur Belajar Mendengarkan</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-50">
                  <FileEdit className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>Ulangan Harian 5 Uraian</span>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300/40 bg-emerald-950/40 shadow-2xl">
                <img
                  src="/images/hero-habasyah.png"
                  alt="Ilustrasi Perjalanan Hijrah Para Sahabat ke Negeri Habasyah menyeberangi Laut Merah"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4">
                  <p className="text-xs font-semibold text-amber-200">
                    Kisah Teladan Periode Makkah • Tahun ke-5 Kenabian
                  </p>
                  <p className="text-xs text-white/90">
                    Makkah → Laut Merah → Negeri Habasyah (Ethiopia)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Entry Card + Module Map */}
        <section className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Student Registration / Entry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#E5DCCB] bg-white p-6 shadow-md sm:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800">
                    Absensi & Mulai Belajar
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                    Masukkan Nama Siswa
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Tuliskan namamu agar Bapak Guru{" "}
                    <span className="font-semibold text-emerald-800">
                      Andrian Dwi Pranata, S.Pd
                    </span>{" "}
                    dapat melihat progres membaca dan hasil Ulangan Harianmu.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStart(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="student-name"
                    className="mb-1.5 block text-sm font-bold text-slate-800"
                  >
                    Nama Lengkap Siswa <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzan Ramadhan"
                    className="w-full rounded-xl border border-[#DDD2BE] bg-[#FCFBF8] px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="student-class"
                      className="mb-1.5 block text-sm font-bold text-slate-800"
                    >
                      Kelas
                    </label>
                    <select
                      id="student-class"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD2BE] bg-[#FCFBF8] px-4 py-3.5 text-base font-medium text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="student-absen"
                      className="mb-1.5 block text-sm font-bold text-slate-800"
                    >
                      Nomor Absen <span className="font-normal text-slate-400">(Opsional)</span>
                    </label>
                    <input
                      id="student-absen"
                      type="text"
                      inputMode="numeric"
                      value={absenNumber}
                      onChange={(e) => setAbsenNumber(e.target.value)}
                      placeholder="Contoh: 05"
                      className="w-full rounded-xl border border-[#DDD2BE] bg-[#FCFBF8] px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-60"
                  >
                    <span>{loading ? "Memproses..." : "Masuk & Mulai Membaca"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStart(true)}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 px-5 py-3.5 text-base font-bold text-amber-900 transition hover:bg-amber-100 active:scale-[0.99] disabled:opacity-60"
                  >
                    <Headphones className="h-5 w-5 text-amber-700" />
                    <span>Belajar dengan Mendengarkan</span>
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-slate-500">
                  Tips: Jika kamu pernah masuk sebelumnya dengan nama dan kelas yang sama,
                  progres bacaan dan jawaban ulanganmu otomatis tersambung kembali.
                </p>
              </form>
            </div>
          </div>

          {/* Right Column: Roadmap & Kurikulum Merdeka KBC Info */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-[#E5DCCB] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <Compass className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  Peta Belajar E-Modul Ini
                </h3>
              </div>

              <ol className="space-y-2.5">
                {MODULE_SECTIONS.map((sec) => (
                  <li
                    key={sec.slug}
                    className="flex items-start gap-3 rounded-xl border border-[#EFE8DA] bg-[#FCFBF8] px-3.5 py-2.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                      {sec.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-snug">
                        {sec.title}
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-700 font-semibold">
                        Nilai KBC: {sec.kbcPillar}
                      </p>
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                    ★
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-950">
                      Ulangan Harian (5 Soal Uraian)
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-amber-800">
                      Evaluasi akhir modul & langsung tercatat di Panel Guru
                    </p>
                  </div>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowObjectives((prev) => !prev)}
                className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
              >
                <Sparkles className="h-4 w-4 text-emerald-700" />
                <span>
                  {showObjectives
                    ? "Sembunyikan Capaian & Tujuan Pembelajaran"
                    : "Lihat Capaian & Tujuan Pembelajaran (CP / TP)"}
                </span>
              </button>

              {showObjectives && (
                <div className="mt-4 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs leading-relaxed text-slate-700">
                  <div>
                    <p className="font-extrabold text-emerald-900">
                      Capaian Pembelajaran (CP):
                    </p>
                    <p className="mt-1">{MODULE_META.capaianPembelajaran}</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-emerald-900">
                      Tujuan Pembelajaran (TP):
                    </p>
                    <ul className="mt-1 space-y-1">
                      {MODULE_META.tujuanPembelajaran.map((tp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#E5DCCB] pt-6 pb-8 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            E-Modul SKI Kelas 4 Semester 1 • {MODULE_META.school} • {MODULE_META.curriculum}
          </p>
          <p className="mt-1">
            Disusun oleh <strong>{MODULE_META.author}</strong> — Semoga menjadi ilmu yang berkah dan bermanfaat.
          </p>
        </footer>
      </main>
    </div>
  );
}
