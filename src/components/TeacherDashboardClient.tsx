"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  BookOpenCheck,
  Headphones,
  FileCheck2,
  Search,
  RefreshCw,
  Download,
  Printer,
  LogOut,
  CheckCircle2,
  Clock,
  Award,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
} from "lucide-react";
import {
  MODULE_META,
  MODULE_SECTIONS,
  ULANGAN_QUESTIONS,
  CLASS_OPTIONS,
} from "@/lib/module-content";
import type {
  TeacherDashboardData,
  TeacherStudentRow,
  ExamSubmissionRecord,
} from "@/types/emodul";

interface TeacherDashboardClientProps {
  initialAuthenticated: boolean;
}

type StatusFilter =
  | "all"
  | "completed_read"
  | "reading"
  | "submitted_exam"
  | "needs_grading"
  | "graded";

export function TeacherDashboardClient({
  initialAuthenticated,
}: TeacherDashboardClientProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Modal state for viewing/grading a student
  const [selectedRow, setSelectedRow] = useState<TeacherStudentRow | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({
    score1: "",
    score2: "",
    score3: "",
    score4: "",
    score5: "",
  });
  const [feedback, setFeedback] = useState("");
  const [showRubric, setShowRubric] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeMessage, setGradeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<TeacherStudentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch("/api/teacher/dashboard", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setDataError(d.error || "Gagal memuat data siswa.");
        return;
      }
      const data = (await res.json()) as TeacherDashboardData;
      setDashboard(data);
    } catch {
      setDataError("Koneksi gagal saat memuat data Panel Guru.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      void fetchDashboard();
    }
  }, [authenticated, fetchDashboard]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Password salah.");
        return;
      }
      setAuthenticated(true);
      setPassword("");
    } catch {
      setLoginError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/teacher/logout", { method: "POST" });
    setAuthenticated(false);
    setDashboard(null);
    setSelectedRow(null);
  }

  function openStudentModal(row: TeacherStudentRow) {
    setSelectedRow(row);
    setGradeMessage(null);
    setShowRubric(false);
    const sub = row.submission;
    setScores({
      score1: sub?.score1 !== null && sub?.score1 !== undefined ? String(sub.score1) : "",
      score2: sub?.score2 !== null && sub?.score2 !== undefined ? String(sub.score2) : "",
      score3: sub?.score3 !== null && sub?.score3 !== undefined ? String(sub.score3) : "",
      score4: sub?.score4 !== null && sub?.score4 !== undefined ? String(sub.score4) : "",
      score5: sub?.score5 !== null && sub?.score5 !== undefined ? String(sub.score5) : "",
    });
    setFeedback(sub?.teacherFeedback ?? "");
  }

  const computedTotalScore = [
    scores.score1,
    scores.score2,
    scores.score3,
    scores.score4,
    scores.score5,
  ].reduce((acc, val) => {
    const num = Number(val);
    return Number.isFinite(num) && val !== "" ? acc + Math.max(0, Math.min(20, num)) : acc;
  }, 0);

  const hasAnyScoreInput = Object.values(scores).some((v) => v.trim() !== "");

  async function handleSaveGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRow) return;

    setSavingGrade(true);
    setGradeMessage(null);
    try {
      const res = await fetch(
        `/api/teacher/submissions/${selectedRow.student.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score1: scores.score1 === "" ? null : Number(scores.score1),
            score2: scores.score2 === "" ? null : Number(scores.score2),
            score3: scores.score3 === "" ? null : Number(scores.score3),
            score4: scores.score4 === "" ? null : Number(scores.score4),
            score5: scores.score5 === "" ? null : Number(scores.score5),
            totalScore: computedTotalScore,
            teacherFeedback: feedback,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setGradeMessage({
          type: "error",
          text: data.error || "Gagal menyimpan nilai.",
        });
        return;
      }

      const updatedSub = data.submission as ExamSubmissionRecord;
      setSelectedRow((prev) =>
        prev ? { ...prev, submission: updatedSub } : null
      );
      setGradeMessage({
        type: "success",
        text: `Nilai (${updatedSub.totalScore}/100) & catatan berhasil disimpan! Siswa kini dapat melihat nilainya.`,
      });
      await fetchDashboard();
    } catch {
      setGradeMessage({
        type: "error",
        text: "Koneksi gagal saat menyimpan penilaian.",
      });
    } finally {
      setSavingGrade(false);
    }
  }

  async function handleDeleteStudent() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/teacher/students/${deleteTarget.student.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        if (selectedRow?.student.id === deleteTarget.student.id) {
          setSelectedRow(null);
        }
        setDeleteTarget(null);
        await fetchDashboard();
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleExportCsv() {
    if (!dashboard) return;
    const headers = [
      "No",
      "Nama Siswa",
      "Kelas",
      "Absen",
      "Waktu Masuk",
      "Bagian Dibaca",
      "Status Baca",
      "Menggunakan Audio",
      "Status Ulangan Harian",
      "Nilai Akhir",
      "Jawaban 1",
      "Jawaban 2",
      "Jawaban 3",
      "Jawaban 4",
      "Jawaban 5",
      "Catatan Guru",
    ];

    const escapeCsv = (val: string | number | null | undefined) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredRecords.map((r, idx) => [
      idx + 1,
      r.student.fullName,
      r.student.className,
      r.student.absenNumber ?? "-",
      new Date(r.student.joinedAt).toLocaleString("id-ID"),
      `${r.readCount}/${r.totalSections}`,
      r.completedReading ? "Selesai Membaca" : "Belum Selesai",
      r.student.usedAudio || r.listenedCount > 0 ? "Ya (Audio)" : "Tidak",
      r.submission?.status === "graded"
        ? "Sudah Dinilai"
        : r.submission?.status === "submitted"
          ? "Sudah Mengumpulkan"
          : r.submission?.status === "draft"
            ? "Draf"
            : "Belum Mengerjakan",
      r.submission?.totalScore ?? "-",
      r.submission?.answer1 ?? "",
      r.submission?.answer2 ?? "",
      r.submission?.answer3 ?? "",
      r.submission?.answer4 ?? "",
      r.submission?.answer5 ?? "",
      r.submission?.teacherFeedback ?? "",
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap-SKI-Kelas4-Habasyah-MI-Sirojul-Huda.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // PASSWORD GATE VIEW
  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F0] parchment-dots px-4 py-10">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#E5DCCB] bg-white shadow-xl">
          <div className="relative bg-gradient-to-br from-[#0B3D26] via-[#0F5132] to-[#15623E] p-7 text-center text-white">
            <div className="islamic-pattern pointer-events-none absolute inset-0 opacity-75" />
            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-300/40">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-amber-200">
                {MODULE_META.school}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold">Panel Guru SKI</h1>
              <p className="mt-1 text-xs text-emerald-100">
                Monitoring Pembacaan Materi & Penilaian Ulangan Harian
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 p-7">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-center text-xs text-emerald-900">
              <p className="font-bold">Guru Pengampu E-Modul:</p>
              <p className="mt-0.5 text-sm font-extrabold">{MODULE_META.author}</p>
            </div>

            <div>
              <label
                htmlFor="teacher-password"
                className="mb-1.5 block text-sm font-bold text-slate-800"
              >
                Password Panel Guru
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="teacher-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password guru..."
                  className="w-full rounded-xl border border-[#DDD2BE] bg-[#FCFBF8] py-3.5 pr-11 pl-10 text-base font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-800"
                  aria-label="Tampilkan atau sembunyikan password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full cursor-pointer rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-md shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk ke Panel Guru"}
            </button>

            <div className="pt-1 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-emerald-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Halaman Siswa E-Modul</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter records
  const records = dashboard?.records ?? [];
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.student.fullName.toLowerCase().includes(q) ||
      r.student.className.toLowerCase().includes(q) ||
      (r.student.absenNumber ?? "").toLowerCase().includes(q);

    const matchesClass =
      classFilter === "ALL" || r.student.className === classFilter;

    let matchesStatus = true;
    if (statusFilter === "completed_read") {
      matchesStatus = r.completedReading;
    } else if (statusFilter === "reading") {
      matchesStatus = !r.completedReading;
    } else if (statusFilter === "submitted_exam") {
      matchesStatus =
        r.submission?.status === "submitted" || r.submission?.status === "graded";
    } else if (statusFilter === "needs_grading") {
      matchesStatus = r.submission?.status === "submitted";
    } else if (statusFilter === "graded") {
      matchesStatus = r.submission?.status === "graded";
    }

    return matchesSearch && matchesClass && matchesStatus;
  });

  // AUTHENTICATED TEACHER DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-16">
      {/* Top Navbar */}
      <header className="no-print sticky top-0 z-30 border-b border-emerald-900/15 bg-gradient-to-r from-[#0B3D26] via-[#0F5132] to-[#145C3B] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-300/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                Panel Guru • {MODULE_META.school}
              </p>
              <h1 className="text-base font-extrabold leading-tight sm:text-lg">
                {MODULE_META.author} — SKI Kelas 4 (Habasyah)
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchDashboard()}
              disabled={loadingData}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`}
              />
              <span>Muat Ulang</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-emerald-950 shadow-xs transition hover:bg-amber-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-white/15"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>E-Modul</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-500/85 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        {/* Print Header (visible only when printing) */}
        <div className="hidden print:block border-b pb-4">
          <h2 className="text-xl font-bold">
            Rekap Aktivitas Membaca & Ulangan Harian E-Modul SKI Kelas 4
          </h2>
          <p className="text-sm">
            {MODULE_META.school} • Materi: {MODULE_META.title} • Guru:{" "}
            {MODULE_META.author}
          </p>
        </div>

        {/* 4 KPI Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Total Siswa Masuk
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {dashboard?.stats.totalStudents ?? 0}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Siswa tercatat membuka E-Modul
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Selesai Membaca (5/5)
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                <BookOpenCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {dashboard?.stats.completedAllReading ?? 0}
            </p>
            <p className="mt-1 text-xs font-semibold text-teal-700">
              Menuntaskan seluruh bagian materi
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Belajar dengan Audio
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <Headphones className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {dashboard?.stats.usedAudioCount ?? 0}
            </p>
            <p className="mt-1 text-xs font-semibold text-amber-700">
              Menggunakan tombol Mendengarkan
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Ulangan Harian Masuk
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800">
                <FileCheck2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <p className="text-3xl font-black text-slate-900">
                {dashboard?.stats.submittedExamCount ?? 0}
              </p>
              {dashboard?.stats.averageScore !== null &&
                dashboard?.stats.averageScore !== undefined && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                    Rata-rata: {dashboard.stats.averageScore}
                  </span>
                )}
            </div>
            <p className="mt-1 text-xs font-semibold text-indigo-700">
              {dashboard?.stats.gradedExamCount ?? 0} sudah dinilai guru
            </p>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="no-print rounded-3xl border border-[#E5DCCB] bg-white p-4 shadow-xs sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa atau nomor absen..."
                className="w-full rounded-xl border border-[#DDD2BE] bg-[#FCFBF8] py-2.5 pr-4 pl-10 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="rounded-xl border border-[#DDD2BE] bg-[#FCFBF8] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">Semua Kelas</option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              {(
                [
                  { id: "all", label: "Semua" },
                  { id: "completed_read", label: "Selesai Baca" },
                  { id: "reading", label: "Belum Tuntas" },
                  { id: "needs_grading", label: "Perlu Dinilai" },
                  { id: "graded", label: "Sudah Dinilai" },
                ] as { id: StatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition ${
                    statusFilter === tab.id
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "border border-[#E5DCCB] bg-[#FCFBF8] text-slate-700 hover:bg-[#F3ECE0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {dataError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
            {dataError}
          </div>
        )}

        {/* Main Monitoring Data Table */}
        <section className="overflow-hidden rounded-3xl border border-[#E5DCCB] bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE8DA] px-5 py-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Daftar Siswa yang Masuk & Membaca Materi
              </h2>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredRecords.length} dari {records.length} siswa • Klik{" "}
                <strong>Detail & Nilai</strong> untuk membaca 5 jawaban uraian dan
                memberikan skor.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE8DA] bg-[#FCFBF8] text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Nama Siswa & Kelas</th>
                  <th className="px-4 py-3.5">Progres Membaca Materi (B1–B5)</th>
                  <th className="px-4 py-3.5">Mode Belajar</th>
                  <th className="px-4 py-3.5">Ulangan Harian</th>
                  <th className="no-print px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DA]">
                {loadingData && records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                    >
                      Memuat daftar siswa MI Sirojul Huda...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                    >
                      Tidak ada data siswa yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((row) => {
                    const progMap = new Map(
                      row.progress.map((p) => [p.sectionSlug, p])
                    );
                    const pct = Math.round(
                      (row.readCount / row.totalSections) * 100
                    );
                    const sub = row.submission;

                    return (
                      <tr
                        key={row.student.id}
                        className="transition hover:bg-[#FCFBF8]"
                      >
                        {/* Student Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
                              {row.student.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">
                                {row.student.fullName}
                              </p>
                              <p className="text-xs font-semibold text-slate-500">
                                {row.student.className}
                                {row.student.absenNumber
                                  ? ` • Absen ${row.student.absenNumber}`
                                  : ""}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock className="h-3 w-3" />
                                Aktif:{" "}
                                {new Date(
                                  row.student.lastActiveAt
                                ).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Chapter-by-Chapter Reading Progress */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {MODULE_SECTIONS.map((sec) => {
                              const p = progMap.get(sec.slug);
                              const isRead = Boolean(p?.isRead);
                              const listened = Boolean(p?.listenedAudio);
                              return (
                                <span
                                  key={sec.slug}
                                  title={`Bagian ${sec.number}: ${sec.shortTitle} — ${
                                    isRead ? "Sudah Dibaca" : "Belum Dibaca"
                                  }${listened ? " (Dengan Audio)" : ""}`}
                                  className={`inline-flex h-7 items-center gap-0.5 rounded-lg px-2 text-[11px] font-extrabold ${
                                    isRead
                                      ? "bg-emerald-700 text-white"
                                      : "border border-[#E5DCCB] bg-[#FAF7F0] text-slate-400"
                                  }`}
                                >
                                  B{sec.number}
                                  {listened && (
                                    <Headphones className="h-2.5 w-2.5 text-amber-300" />
                                  )}
                                </span>
                              );
                            })}
                            <span className="ml-1.5 text-xs font-extrabold text-slate-700">
                              {row.readCount}/{row.totalSections}
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-[#EFE8DA]">
                            <div
                              className={`h-full rounded-full ${
                                row.completedReading
                                  ? "bg-emerald-600"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>

                        {/* Learning Mode */}
                        <td className="px-4 py-4">
                          {row.student.usedAudio || row.listenedCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                              <Headphones className="h-3.5 w-3.5 text-amber-700" />
                              Audio ({row.listenedCount} bag.)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              <BookOpen className="h-3.5 w-3.5" />
                              Membaca Teks
                            </span>
                          )}
                        </td>

                        {/* Ulangan Harian Status */}
                        <td className="px-4 py-4">
                          {sub?.status === "graded" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
                              <Award className="h-3.5 w-3.5 text-emerald-700" />
                              Nilai: {sub.totalScore}/100
                            </span>
                          ) : sub?.status === "submitted" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-950 ring-1 ring-amber-300">
                              <FileCheck2 className="h-3.5 w-3.5 text-amber-700" />
                              Menunggu Nilai
                            </span>
                          ) : sub?.status === "draft" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                              Menyimpan Draf
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                              Belum Mengerjakan
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="no-print px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openStudentModal(row)}
                              className="cursor-pointer rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-800"
                            >
                              Detail & Nilai
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(row)}
                              title="Hapus data siswa ini"
                              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#E5DCCB] text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* STUDENT DETAIL & GRADING MODAL */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-xs sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#E5DCCB] bg-[#FAF7F0] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/15 bg-gradient-to-r from-[#0B3D26] to-[#145C3B] px-6 py-4 text-white">
              <div>
                <p className="text-xs font-bold text-amber-200">
                  Detail Belajar & Penilaian Ulangan Harian
                </p>
                <h3 className="text-lg font-extrabold">
                  {selectedRow.student.fullName} ({selectedRow.student.className}
                  {selectedRow.student.absenNumber
                    ? ` • Absen ${selectedRow.student.absenNumber}`
                    : ""}
                  )
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Reading Checklist Breakdown */}
              <div className="rounded-2xl border border-[#E5DCCB] bg-white p-5">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Riwayat Membaca & Mendengarkan Materi ({selectedRow.readCount}/
                  {selectedRow.totalSections} Bagian)
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {MODULE_SECTIONS.map((sec) => {
                    const p = selectedRow.progress.find(
                      (item) => item.sectionSlug === sec.slug
                    );
                    const isRead = Boolean(p?.isRead);
                    const listened = Boolean(p?.listenedAudio);

                    return (
                      <div
                        key={sec.slug}
                        className={`rounded-xl border p-3 text-xs ${
                          isRead
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-[#EFE8DA] bg-[#FCFBF8]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900">
                            Bagian {sec.number}: {sec.shortTitle}
                          </span>
                          {isRead ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Belum
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          {p?.completedAt && (
                            <span>
                              {new Date(p.completedAt).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {listened && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-900">
                              <Headphones className="h-3 w-3" />
                              Audio
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Essay Answers & Grading Form */}
              <div className="rounded-2xl border border-[#E5DCCB] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Jawaban Ulangan Harian (5 Soal Uraian)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Status:{" "}
                      <strong className="text-emerald-800">
                        {selectedRow.submission?.status === "graded"
                          ? `Sudah Dinilai (${selectedRow.submission.totalScore}/100)`
                          : selectedRow.submission?.status === "submitted"
                            ? "Sudah Dikumpulkan — Siap Dinilai"
                            : selectedRow.submission?.status === "draft"
                              ? "Masih Draf (Belum Dikumpulkan)"
                              : "Siswa belum mengerjakan Ulangan Harian"}
                      </strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRubric((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
                  >
                    <span>
                      {showRubric
                        ? "Sembunyikan Kunci / Rubrik"
                        : "Lihat Kunci / Rubrik Guru"}
                    </span>
                    {showRubric ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {!selectedRow.submission ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#DDD2BE] bg-[#FCFBF8] p-6 text-center text-sm font-medium text-slate-500">
                    Siswa ini belum menuliskan jawaban Ulangan Harian.
                  </div>
                ) : (
                  <form onSubmit={handleSaveGrade} className="mt-4 space-y-4">
                    {ULANGAN_QUESTIONS.map((q) => {
                      const ans = selectedRow.submission?.[q.field] ?? "";
                      return (
                        <div
                          key={q.number}
                          className="rounded-2xl border border-[#EFE8DA] bg-[#FCFBF8] p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <p className="text-sm font-bold text-slate-900">
                              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                                {q.number}
                              </span>
                              {q.question}
                            </p>
                            <div className="flex shrink-0 items-center gap-2">
                              <label
                                htmlFor={`grade-q-${q.number}`}
                                className="text-xs font-bold text-slate-600"
                              >
                                Skor (0–20):
                              </label>
                              <input
                                id={`grade-q-${q.number}`}
                                type="number"
                                min={0}
                                max={20}
                                value={scores[q.scoreField]}
                                onChange={(e) =>
                                  setScores((prev) => ({
                                    ...prev,
                                    [q.scoreField]: e.target.value,
                                  }))
                                }
                                placeholder="0-20"
                                className="w-20 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-center text-sm font-extrabold text-emerald-950 focus:border-emerald-600 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl border border-[#E5DCCB] bg-white p-3.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {ans || (
                              <em className="text-slate-400">
                                (Tidak ada jawaban)
                              </em>
                            )}
                          </div>

                          {showRubric && (
                            <div className="mt-2.5 rounded-xl bg-amber-50/90 px-3.5 py-2.5 text-xs leading-relaxed text-amber-950">
                              <strong>Rubrik Guru:</strong> {q.rubric}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Total Score & Teacher Feedback */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                            Total Nilai Otomatis (Skala 0–100)
                          </p>
                          <p className="text-xs text-slate-600">
                            Jumlah dari skor soal nomor 1 sampai 5
                          </p>
                        </div>
                        <div className="rounded-2xl bg-emerald-800 px-5 py-2 text-center text-white shadow-xs">
                          <span className="text-2xl font-black">
                            {hasAnyScoreInput
                              ? computedTotalScore
                              : (selectedRow.submission.totalScore ?? 0)}
                          </span>
                          <span className="ml-1 text-xs font-semibold text-emerald-200">
                            / 100
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor="teacher-feedback"
                          className="mb-1.5 block text-xs font-extrabold text-emerald-950"
                        >
                          Catatan / Umpan Balik dari Bapak Andrian Dwi Pranata, S.Pd:
                        </label>
                        <textarea
                          id="teacher-feedback"
                          rows={3}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Tuliskan apresiasi atau masukan membangun untuk siswa..."
                          className="w-full rounded-xl border border-emerald-200 bg-white p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      {gradeMessage && (
                        <div
                          className={`mt-3 rounded-xl px-4 py-2.5 text-xs font-bold ${
                            gradeMessage.type === "success"
                              ? "bg-emerald-700 text-white"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {gradeMessage.text}
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingGrade}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
                        >
                          <Save className="h-4 w-4" />
                          <span>
                            {savingGrade
                              ? "Menyimpan Nilai..."
                              : "Simpan Nilai & Umpan Balik"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#E5DCCB] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              Hapus Data Siswa?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Data progres membaca dan jawaban Ulangan Harian milik{" "}
              <strong>{deleteTarget.student.fullName}</strong> (
              {deleteTarget.student.className}) akan dihapus permanen.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteStudent}
                className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
