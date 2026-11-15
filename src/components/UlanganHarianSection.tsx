"use client";

import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Volume2,
  Save,
  Send,
  CheckCircle2,
  Award,
  AlertCircle,
  Printer,
  Edit3,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { ULANGAN_QUESTIONS, MODULE_META } from "@/lib/module-content";
import type { StudentRecord, ExamSubmissionRecord } from "@/types/emodul";

interface UlanganHarianSectionProps {
  student: StudentRecord;
  submission: ExamSubmissionRecord | null;
  readCount: number;
  totalSections: number;
  onSpeakQuestion: (text: string) => void;
  onSaved: (submission: ExamSubmissionRecord) => void;
  onBackToMaterial: () => void;
}

export function UlanganHarianSection({
  student,
  submission,
  readCount,
  totalSections,
  onSpeakQuestion,
  onSaved,
  onBackToMaterial,
}: UlanganHarianSectionProps) {
  const [answers, setAnswers] = useState({
    answer1: submission?.answer1 ?? "",
    answer2: submission?.answer2 ?? "",
    answer3: submission?.answer3 ?? "",
    answer4: submission?.answer4 ?? "",
    answer5: submission?.answer5 ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (submission) {
      setAnswers({
        answer1: submission.answer1 ?? "",
        answer2: submission.answer2 ?? "",
        answer3: submission.answer3 ?? "",
        answer4: submission.answer4 ?? "",
        answer5: submission.answer5 ?? "",
      });
    }
  }, [submission]);

  const isGraded = submission?.status === "graded";
  const isSubmitted = submission?.status === "submitted" && !isEditingSubmitted;
  const showResultCard = isGraded || isSubmitted;

  const answeredCount = ULANGAN_QUESTIONS.filter(
    (q) => answers[q.field].trim().length >= 5
  ).length;

  async function handleSave(submitNow: boolean) {
    if (submitNow) {
      setSubmitting(true);
    } else {
      setSaving(true);
    }
    setMessage(null);

    try {
      const res = await fetch(`/api/students/${student.id}/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          submit: submitNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Gagal menyimpan jawaban Ulangan Harian.",
        });
        setConfirmOpen(false);
        return;
      }

      onSaved(data.submission as ExamSubmissionRecord);
      setConfirmOpen(false);
      setIsEditingSubmitted(false);
      setMessage({
        type: "success",
        text: submitNow
          ? "Alhamdulillah! Ulangan Harian kamu berhasil dikumpulkan dan masuk ke Panel Guru."
          : "Draf jawaban berhasil disimpan. Kamu bisa melanjutkannya kapan saja.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Koneksi gagal saat menyimpan jawaban. Coba klik lagi ya.",
      });
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  function handleRequestSubmit() {
    setMessage(null);
    const incomplete = ULANGAN_QUESTIONS.filter(
      (q) => answers[q.field].trim().length < 5
    ).map((q) => q.number);

    if (incomplete.length > 0) {
      setMessage({
        type: "error",
        text: `Soal nomor ${incomplete.join(", ")} belum diisi dengan lengkap (minimal 5 huruf). Yuk lengkapi dulu sebelum mengumpulkan!`,
      });
      return;
    }
    setConfirmOpen(true);
  }

  // Celebratory Result / Certificate View when submitted or graded
  if (showResultCard && submission) {
    const scoreBadgeColor =
      (submission.totalScore ?? 0) >= 85
        ? "from-emerald-600 to-emerald-800"
        : (submission.totalScore ?? 0) >= 70
          ? "from-amber-500 to-amber-700"
          : "from-sky-600 to-sky-800";

    return (
      <div className="space-y-6">
        {/* Certificate Card */}
        <div className="overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-lg">
          <div className="relative bg-gradient-to-r from-[#0B3D26] via-[#0F5132] to-[#15623E] px-6 py-7 text-white sm:px-8">
            <div className="islamic-pattern pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/40">
                  <Award className="h-4 w-4 text-amber-300" />
                  <span>
                    {isGraded
                      ? "Hasil Penilaian Ulangan Harian"
                      : "Bukti Pengumpulan Ulangan Harian"}
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  Alhamdulillah, Hebat Sekali!
                </h2>
                <p className="mt-1 text-sm text-emerald-100">
                  {student.fullName} ({student.className}
                  {student.absenNumber ? ` • Absen ${student.absenNumber}` : ""}) telah
                  menyelesaikan Ulangan Harian SKI Kelas 4.
                </p>
              </div>

              {isGraded && submission.totalScore !== null ? (
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${scoreBadgeColor} px-6 py-4 text-center shadow-lg ring-2 ring-amber-300/60`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                    Nilai Akhir
                  </span>
                  <span className="text-4xl font-black text-white">
                    {submission.totalScore}
                  </span>
                  <span className="text-[11px] font-semibold text-white/85">
                    dari 100
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-300/40 bg-white/10 px-5 py-3 text-center backdrop-blur-xs">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-amber-300" />
                  <p className="mt-1 text-xs font-bold text-amber-200">
                    Terkirim ke Panel Guru
                  </p>
                  <p className="text-[11px] text-emerald-100">
                    Menunggu penilaian Pak Andrian
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {/* Summary Info Strip */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#EFE8DA] bg-[#FCFBF8] p-4">
                <p className="text-xs font-bold text-slate-500">Materi Terbaca</p>
                <p className="mt-1 text-lg font-extrabold text-emerald-800">
                  {readCount} / {totalSections} Bagian
                </p>
              </div>
              <div className="rounded-2xl border border-[#EFE8DA] bg-[#FCFBF8] p-4">
                <p className="text-xs font-bold text-slate-500">Waktu Pengumpulan</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-[#EFE8DA] bg-[#FCFBF8] p-4">
                <p className="text-xs font-bold text-slate-500">Guru Pengampu</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {MODULE_META.author}
                </p>
              </div>
            </div>

            {/* Teacher Feedback Box */}
            {submission.teacherFeedback && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  <span>Catatan dari Bapak {MODULE_META.author}:</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-emerald-950">
                  “{submission.teacherFeedback}”
                </p>
              </div>
            )}

            {/* Review of the 5 Essay Answers */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Rekap Jawaban 5 Soal Uraian Kamu
              </h3>
              {ULANGAN_QUESTIONS.map((q) => {
                const ans = submission[q.field];
                const qScore = submission[q.scoreField];
                return (
                  <div
                    key={q.number}
                    className="rounded-2xl border border-[#E8DFCE] bg-[#FCFBF8] p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                          {q.number}
                        </span>
                        {q.question}
                      </p>
                      {isGraded && qScore !== null && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                          Skor: {qScore} / {q.maxScore}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 rounded-xl border border-[#EFE8DA] bg-white p-3.5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {ans || <em className="text-slate-400">(Belum diisi)</em>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="no-print flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-800"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Bukti Belajar</span>
              </button>

              {!isGraded && (
                <button
                  type="button"
                  onClick={() => setIsEditingSubmitted(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Perbaiki Jawaban</span>
                </button>
              )}

              <button
                type="button"
                onClick={onBackToMaterial}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DDD2BE] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-[#FAF7F0]"
              >
                <BookOpen className="h-4 w-4" />
                <span>Baca Kembali Materi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Essay Exam Form
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="overflow-hidden rounded-3xl border border-amber-300/70 bg-gradient-to-br from-amber-50 via-[#FFFBF0] to-emerald-50/70 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-extrabold text-amber-900">
            <FileEdit className="h-4 w-4 text-amber-700" />
            <span>Evaluasi Akhir E-Modul • 5 Soal Uraian</span>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs ring-1 ring-emerald-200">
            Terisi: {answeredCount} / 5 Soal
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Ulangan Harian: Hijrahnya Para Sahabat ke Habasyah
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Jawablah kelima pertanyaan uraian berikut ini dengan jujur menggunakan bahasamu
          sendiri. Kamu juga dapat menekan tombol{" "}
          <strong className="text-emerald-800">Dengarkan Soal</strong> di setiap nomor agar
          soal dibacakan dengan jelas.
        </p>

        {readCount < totalSections && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-100/70 px-4 py-3 text-xs font-semibold text-amber-950">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>
              Catatan: Kamu baru menandai {readCount} dari {totalSections} bagian materi.
              Kamu tetap bisa mengerjakan Ulangan Harian, atau kembali membaca sisa materi
              terlebih dahulu agar nilaimu semakin maksimal!
            </span>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3.5 text-sm font-bold ${
            message.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-rose-300 bg-rose-50 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 5 Essay Cards */}
      <div className="space-y-5">
        {ULANGAN_QUESTIONS.map((q) => {
          const val = answers[q.field];
          const isFilled = val.trim().length >= 5;

          return (
            <div
              key={q.number}
              className="rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-xs transition hover:border-emerald-300 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                      isFilled
                        ? "bg-emerald-700 text-white"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {q.number}
                  </span>
                  <div>
                    <label
                      htmlFor={`essay-${q.number}`}
                      className="block text-base font-bold leading-snug text-slate-900"
                    >
                      {q.question}
                    </label>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Petunjuk: {q.hint}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSpeakQuestion(`Soal nomor ${q.number}. ${q.question}`)
                  }
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Dengarkan Soal</span>
                </button>
              </div>

              <div className="mt-4">
                <textarea
                  id={`essay-${q.number}`}
                  rows={4}
                  value={val}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.field]: e.target.value }))
                  }
                  placeholder={`Tuliskan jawaban uraian nomor ${q.number} di sini...`}
                  className="w-full rounded-2xl border border-[#DDD2BE] bg-[#FCFBF8] p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {isFilled ? (
                      <span className="font-bold text-emerald-700">✓ Sudah terjawab</span>
                    ) : (
                      <span>Minimal 5 huruf agar jawaban jelas</span>
                    )}
                  </span>
                  <span>{val.trim().length} karakter</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action Bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={saving || submitting}
          onClick={() => handleSave(false)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDD2BE] bg-[#FAF7F0] px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-[#F2EBD9] disabled:opacity-60"
        >
          <Save className="h-4 w-4 text-emerald-700" />
          <span>{saving ? "Menyimpan Draf..." : "Simpan Draf"}</span>
        </button>

        <button
          type="button"
          disabled={saving || submitting}
          onClick={handleRequestSubmit}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-emerald-900/15 transition hover:from-emerald-800 hover:to-emerald-900 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          <span>
            {submitting
              ? "Mengumpulkan..."
              : "Kumpulkan Ulangan Harian ke Bapak Guru"}
          </span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#E5DCCB] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">
              Kumpulkan Ulangan Harian Sekarang?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Pastikan kamu sudah memeriksa kembali kelima jawaban uraianmu ya,{" "}
              <strong>{student.fullName}</strong>. Setelah dikumpulkan, jawabanmu akan
              langsung tampil di Panel Guru Bapak Andrian Dwi Pranata, S.Pd.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{submitting ? "Mengirim..." : "Ya, Kumpulkan Sekarang"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
