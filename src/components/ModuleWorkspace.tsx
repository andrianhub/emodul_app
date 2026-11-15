"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  CheckCircle2,
  Circle,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  ShieldCheck,
  LogOut,
  Clock,
  Volume2,
  HelpCircle,
  Check,
  X,
  Award,
} from "lucide-react";
import { MODULE_META, MODULE_SECTIONS } from "@/lib/module-content";
import { useSpeechNarration } from "@/hooks/useSpeechNarration";
import { AudioNarrationBar } from "@/components/AudioNarrationBar";
import { UlanganHarianSection } from "@/components/UlanganHarianSection";
import type {
  StudentRecord,
  ProgressRecord,
  ExamSubmissionRecord,
} from "@/types/emodul";

type ActiveTab = string; // "bagian-1" .. "bagian-5" | "ulangan"

interface ModuleWorkspaceProps {
  student: StudentRecord;
  progress: ProgressRecord[];
  submission: ExamSubmissionRecord | null;
  autoStartListen?: boolean;
  onUpdateStudent: (student: StudentRecord) => void;
  onUpdateProgress: (progress: ProgressRecord[]) => void;
  onUpdateSubmission: (submission: ExamSubmissionRecord) => void;
  onSwitchStudent: () => void;
}

export function ModuleWorkspace({
  student,
  progress,
  submission,
  autoStartListen = false,
  onUpdateStudent,
  onUpdateProgress,
  onUpdateSubmission,
  onSwitchStudent,
}: ModuleWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(MODULE_SECTIONS[0].slug);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const narration = useSpeechNarration();
  const autoStartTriggeredRef = useRef(false);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => {
      setToast((prev) => (prev === text ? null : prev));
    }, 3800);
  }, []);

  const progressMap = new Map<string, ProgressRecord>();
  for (const item of progress) {
    progressMap.set(item.sectionSlug, item);
  }

  const readCount = MODULE_SECTIONS.filter(
    (s) => progressMap.get(s.slug)?.isRead
  ).length;
  const totalSections = MODULE_SECTIONS.length;
  const readPercent = Math.round((readCount / totalSections) * 100);

  const currentSectionIndex = MODULE_SECTIONS.findIndex(
    (s) => s.slug === activeTab
  );
  const currentSection =
    currentSectionIndex >= 0 ? MODULE_SECTIONS[currentSectionIndex] : null;

  const syncProgressToServer = useCallback(
    async (payload: {
      sectionSlug?: string;
      isRead?: boolean;
      listenedAudio?: boolean;
      usedAudio?: boolean;
      addAudioMinutes?: number;
    }) => {
      try {
        if (payload.sectionSlug && payload.isRead) {
          setSavingSection(payload.sectionSlug);
        }
        const res = await fetch(`/api/students/${student.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.student) onUpdateStudent(data.student as StudentRecord);
          if (data.progress) onUpdateProgress(data.progress as ProgressRecord[]);
        }
      } catch (err) {
        console.error("Progress sync error:", err);
      } finally {
        setSavingSection(null);
      }
    },
    [student.id, onUpdateStudent, onUpdateProgress]
  );

  // Start reading a specific section aloud via Indonesian TTS
  const startListeningSection = useCallback(
    (sectionIndex: number, startParagraph = 0) => {
      const section = MODULE_SECTIONS[sectionIndex];
      if (!section) return;

      const items = [
        `Bagian ${section.number}. ${section.title}. ${section.paragraphs[0]}`,
        ...section.paragraphs.slice(1),
      ];

      // Mark that student uses audio learning right away
      const existing = progressMap.get(section.slug);
      void syncProgressToServer({
        sectionSlug: section.slug,
        isRead: existing?.isRead ?? false,
        listenedAudio: true,
        usedAudio: true,
      });

      narration.speakList({
        sectionSlug: section.slug,
        items,
        startIndex: startParagraph,
        onCompleteAll: () => {
          // Automatically mark section complete when finished listening!
          void syncProgressToServer({
            sectionSlug: section.slug,
            isRead: true,
            listenedAudio: true,
            usedAudio: true,
            addAudioMinutes: section.estimatedMinutes,
          });
          showToast(
            `Hebat! Bagian ${section.number} selesai didengarkan & otomatis ditandai selesai dibaca.`
          );

          if (autoAdvance && sectionIndex + 1 < MODULE_SECTIONS.length) {
            const nextSec = MODULE_SECTIONS[sectionIndex + 1];
            setActiveTab(nextSec.slug);
            setTimeout(() => {
              startListeningSection(sectionIndex + 1, 0);
            }, 650);
          }
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoAdvance, narration.speakList, syncProgressToServer, showToast]
  );

  // Trigger audio immediately if student chose "Belajar dengan Mendengarkan" on login screen
  useEffect(() => {
    if (autoStartListen && !autoStartTriggeredRef.current) {
      autoStartTriggeredRef.current = true;
      const timer = setTimeout(() => {
        startListeningSection(0, 0);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [autoStartListen, startListeningSection]);

  // Gently scroll active highlighted paragraph into view when playing
  useEffect(() => {
    if (
      narration.isPlaying &&
      currentSection &&
      narration.activeSectionSlug === currentSection.slug &&
      narration.activeIndex >= 0
    ) {
      const el = paragraphRefs.current[narration.activeIndex];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [narration.isPlaying, narration.activeIndex, narration.activeSectionSlug, currentSection]);

  function handleTabSwitch(slug: ActiveTab) {
    if (slug !== activeTab) {
      narration.stop();
      setActiveTab(slug);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleMarkRead(sectionSlug: string, currentlyRead: boolean) {
    await syncProgressToServer({
      sectionSlug,
      isRead: !currentlyRead,
    });
    if (!currentlyRead) {
      showToast("Bagian materi berhasil ditandai selesai dibaca ✓");
    }
  }

  function handleSelectQuizOption(sectionSlug: string, optionIdx: number, correctIdx: number) {
    setQuizAnswers((prev) => ({ ...prev, [sectionSlug]: optionIdx }));
    if (optionIdx === correctIdx && !progressMap.get(sectionSlug)?.isRead) {
      void syncProgressToServer({ sectionSlug, isRead: true });
      showToast("Jawaban tepat! Bagian ini otomatis ditandai selesai dibaca ✓");
    }
  }

  const isCurrentSectionPlaying =
    currentSection !== null &&
    narration.activeSectionSlug === currentSection.slug &&
    (narration.isPlaying || narration.isPaused);

  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-16">
      {/* Top Sticky Header */}
      <header className="no-print sticky top-0 z-30 border-b border-[#E5DCCB] bg-[#FAF7F0]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F5132] to-[#198754] text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wider text-emerald-800">
                {MODULE_META.school} • SKI Kelas 4
              </p>
              <p className="truncate text-sm font-extrabold text-slate-900">
                {MODULE_META.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Badge */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-extrabold text-white">
                {student.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-xs font-extrabold text-emerald-950">
                  {student.fullName}
                </p>
                <p className="text-[10px] font-bold text-emerald-700">
                  {student.className} • {readCount}/{totalSections} Dibaca
                </p>
              </div>
            </div>

            <Link
              href="/guru"
              onClick={() => narration.stop()}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
              <span className="hidden sm:inline">Panel Guru</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                narration.stop();
                onSwitchStudent();
              }}
              title="Ganti Nama Siswa"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DDD2BE] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Ganti Siswa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Student Strip & Horizontal Chapter Pills */}
      <div className="no-print border-b border-[#E5DCCB] bg-white px-4 py-3 lg:hidden">
        <div className="mb-2.5 flex items-center justify-between text-xs">
          <span className="font-extrabold text-emerald-900">
            Siswa: {student.fullName} ({student.className})
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
            {readCount}/{totalSections} Materi
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MODULE_SECTIONS.map((sec) => {
            const isRead = Boolean(progressMap.get(sec.slug)?.isRead);
            const active = activeTab === sec.slug;
            return (
              <button
                key={sec.slug}
                type="button"
                onClick={() => handleTabSwitch(sec.slug)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-emerald-700 text-white shadow-xs"
                    : isRead
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border border-[#E5DCCB] bg-[#FCFBF8] text-slate-700"
                }`}
              >
                {isRead ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <span>{sec.number}.</span>
                )}
                <span>{sec.shortTitle}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleTabSwitch("ulangan")}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition ${
              activeTab === "ulangan"
                ? "bg-amber-600 text-white shadow-xs"
                : "border border-amber-300 bg-amber-50 text-amber-950"
            }`}
          >
            <FileEdit className="h-3.5 w-3.5" />
            <span>Ulangan Harian</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="no-print fixed right-4 bottom-5 z-50 flex max-w-sm items-center gap-2.5 rounded-2xl border border-emerald-300 bg-[#0F5132] px-4 py-3 text-sm font-bold text-white shadow-xl">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="mx-auto grid max-w-7xl gap-7 px-4 pt-6 sm:px-6 lg:grid-cols-12">
        {/* Left Sticky Sidebar (Desktop) */}
        <aside className="no-print hidden lg:col-span-4 lg:block xl:col-span-3">
          <div className="sticky top-[82px] space-y-5">
            {/* Reading Progress Summary Card */}
            <div className="rounded-3xl border border-[#E5DCCB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  Progres Belajar
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  {readPercent}%
                </span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#EFE8DA]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
                  style={{ width: `${readPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {readCount} dari {totalSections} bagian materi selesai dibaca
              </p>

              {/* Quick Audio CTA in sidebar */}
              {currentSection && (
                <button
                  type="button"
                  onClick={() => {
                    if (isCurrentSectionPlaying && narration.isPlaying) {
                      narration.pause();
                    } else if (isCurrentSectionPlaying && narration.isPaused) {
                      narration.resume();
                    } else {
                      startListeningSection(currentSectionIndex, 0);
                    }
                  }}
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-extrabold text-amber-900 ring-1 ring-amber-300 transition hover:bg-amber-100"
                >
                  <Headphones className="h-4 w-4 text-amber-700" />
                  <span>
                    {isCurrentSectionPlaying && narration.isPlaying
                      ? "Jeda Audio Materi"
                      : "Belajar dengan Mendengarkan"}
                  </span>
                </button>
              )}
            </div>

            {/* Chapter Navigation List */}
            <nav className="rounded-3xl border border-[#E5DCCB] bg-white p-4 shadow-xs">
              <p className="mb-3 px-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Daftar Materi Modul
              </p>
              <div className="space-y-1.5">
                {MODULE_SECTIONS.map((sec) => {
                  const prog = progressMap.get(sec.slug);
                  const isRead = Boolean(prog?.isRead);
                  const listened = Boolean(prog?.listenedAudio);
                  const isActive = activeTab === sec.slug;

                  return (
                    <button
                      key={sec.slug}
                      type="button"
                      onClick={() => handleTabSwitch(sec.slug)}
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        isActive
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "text-slate-700 hover:bg-[#FAF7F0]"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isRead ? (
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              isActive ? "text-amber-300" : "text-emerald-600"
                            }`}
                          />
                        ) : (
                          <Circle
                            className={`h-4 w-4 ${
                              isActive ? "text-emerald-200" : "text-slate-300"
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold leading-snug">
                          {sec.number}. {sec.shortTitle}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                          <span
                            className={
                              isActive ? "text-emerald-100" : "text-slate-500"
                            }
                          >
                            {sec.estimatedMinutes} mnt
                          </span>
                          {listened && (
                            <span
                              className={`inline-flex items-center gap-0.5 font-bold ${
                                isActive ? "text-amber-200" : "text-amber-700"
                              }`}
                            >
                              <Headphones className="h-3 w-3" />
                              Audio
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="my-3 border-t border-[#EFE8DA]" />

              {/* Ulangan Harian Nav Item */}
              <button
                type="button"
                onClick={() => handleTabSwitch("ulangan")}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition ${
                  activeTab === "ulangan"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm"
                    : "border border-amber-300/80 bg-amber-50/70 text-amber-950 hover:bg-amber-100"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    activeTab === "ulangan"
                      ? "bg-white/20 text-white"
                      : "bg-amber-200/80 text-amber-900"
                  }`}
                >
                  {submission?.status === "graded" ? (
                    <Award className="h-4 w-4" />
                  ) : (
                    <FileEdit className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold">Ulangan Harian</p>
                  <p
                    className={`text-[11px] font-semibold ${
                      activeTab === "ulangan" ? "text-amber-100" : "text-amber-800"
                    }`}
                  >
                    {submission?.status === "graded"
                      ? `Sudah Dinilai: ${submission.totalScore}/100`
                      : submission?.status === "submitted"
                        ? "Sudah Dikumpulkan ✓"
                        : "5 Soal Uraian"}
                  </p>
                </div>
              </button>
            </nav>

            {/* Author Card */}
            <div className="rounded-3xl border border-[#E5DCCB] bg-[#FCFBF8] p-4 text-xs text-slate-600">
              <p className="font-extrabold text-emerald-900">{MODULE_META.school}</p>
              <p className="mt-0.5 font-semibold text-slate-700">
                Penyusun: {MODULE_META.author}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {MODULE_META.curriculum}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8 xl:col-span-9">
          {activeTab === "ulangan" ? (
            <UlanganHarianSection
              student={student}
              submission={submission}
              readCount={readCount}
              totalSections={totalSections}
              onSpeakQuestion={(text) => {
                void syncProgressToServer({ usedAudio: true });
                narration.speakSingle(text, "ulangan-question");
              }}
              onSaved={(savedSub) => {
                onUpdateSubmission(savedSub);
              }}
              onBackToMaterial={() => handleTabSwitch(MODULE_SECTIONS[0].slug)}
            />
          ) : currentSection ? (
            <div>
              {/* Sticky Audio Narration Bar */}
              <AudioNarrationBar
                supported={narration.supported}
                isPlaying={isCurrentSectionPlaying && narration.isPlaying}
                isPaused={isCurrentSectionPlaying && narration.isPaused}
                activeIndex={
                  isCurrentSectionPlaying ? narration.activeIndex : -1
                }
                totalItems={
                  isCurrentSectionPlaying
                    ? narration.totalItems
                    : currentSection.paragraphs.length
                }
                sectionTitle={`Bagian ${currentSection.number}: ${currentSection.title}`}
                rate={narration.rate}
                autoAdvance={autoAdvance}
                onToggleAutoAdvance={() => setAutoAdvance((v) => !v)}
                onPlaySection={() => startListeningSection(currentSectionIndex, 0)}
                onPause={narration.pause}
                onResume={narration.resume}
                onStop={narration.stop}
                onPrev={narration.prevParagraph}
                onNext={narration.nextParagraph}
                onChangeRate={narration.setRate}
              />

              {/* Reading Article Card */}
              <article className="overflow-hidden rounded-3xl border border-[#E5DCCB] bg-white shadow-sm">
                {/* Chapter Top Banner */}
                <div className="border-b border-[#EFE8DA] bg-gradient-to-br from-[#F4FBF7] via-white to-[#FFFBF0] p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1 text-xs font-extrabold text-white">
                      Bagian {currentSection.number} dari {totalSections}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-200">
                      <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                      KBC: {currentSection.kbcPillar}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      ± {currentSection.estimatedMinutes} menit
                    </span>
                    {progressMap.get(currentSection.slug)?.isRead && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selesai Dibaca
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                    {currentSection.title}
                  </h1>
                  <p className="mt-2 text-base font-medium text-slate-600">
                    {currentSection.subtitle}
                  </p>
                </div>

                {/* Body Content */}
                <div className="space-y-6 p-6 sm:p-8">
                  {/* Optional Storybook Plate Illustration */}
                  {currentSection.image && (
                    <figure className="overflow-hidden rounded-2xl border border-[#E5DCCB] bg-[#FCFBF8]">
                      <img
                        src={currentSection.image.src}
                        alt={currentSection.image.alt}
                        className="max-h-[380px] w-full object-cover"
                      />
                      <figcaption className="border-t border-[#EFE8DA] px-4 py-3 text-xs font-medium italic text-slate-600">
                        {currentSection.image.caption}
                      </figcaption>
                    </figure>
                  )}

                  {/* Story Paragraphs with Live Karaoke Highlighting */}
                  <div className="space-y-4">
                    {currentSection.paragraphs.map((paragraph, pIdx) => {
                      const isSpokenNow =
                        isCurrentSectionPlaying &&
                        narration.activeIndex === pIdx;

                      return (
                        <div
                          key={pIdx}
                          ref={(el) => {
                            paragraphRefs.current[pIdx] = el;
                          }}
                          className={`group relative rounded-2xl p-4 transition-all duration-300 sm:px-5 ${
                            isSpokenNow
                              ? "bg-emerald-50/90 ring-2 ring-emerald-500/70 shadow-sm"
                              : "bg-transparent hover:bg-[#FCFBF8]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <p
                              className={`flex-1 text-[17px] leading-[1.85] ${
                                isSpokenNow
                                  ? "font-semibold text-emerald-950"
                                  : "text-[#243038]"
                              }`}
                            >
                              {paragraph}
                            </p>
                            {narration.supported && (
                              <button
                                type="button"
                                onClick={() =>
                                  startListeningSection(
                                    currentSectionIndex,
                                    pIdx
                                  )
                                }
                                title="Dengarkan mulai dari paragraf ini"
                                className={`no-print mt-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition ${
                                  isSpokenNow
                                    ? "bg-emerald-700 text-white"
                                    : "bg-emerald-50 text-emerald-700 opacity-70 hover:bg-emerald-100 hover:opacity-100"
                                }`}
                              >
                                <Volume2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Key Facts Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {currentSection.keyFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#EAE0CE] bg-[#FCFBF8] p-4"
                      >
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                          {fact.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                          {fact.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Optional Comparison Table (Bagian 3) */}
                  {currentSection.comparisonTable && (
                    <div className="overflow-hidden rounded-2xl border border-[#E5DCCB]">
                      <div className="bg-emerald-800 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-amber-200">
                        Tabel Perbandingan Hijrah ke Habasyah Gelombang I & II
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-[#E5DCCB] bg-[#FAF7F0]">
                              {currentSection.comparisonTable.headers.map(
                                (head, i) => (
                                  <th
                                    key={i}
                                    className="px-4 py-3 font-extrabold text-emerald-950"
                                  >
                                    {head}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EFE8DA] bg-white">
                            {currentSection.comparisonTable.rows.map(
                              (row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[#FCFBF8]">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`px-4 py-3 ${
                                        cIdx === 0
                                          ? "font-bold text-slate-900"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Hikmah / KBC Callout Box */}
                  <div className="rounded-2xl border border-amber-300/70 bg-gradient-to-r from-amber-50 via-[#FFFBF0] to-emerald-50/40 p-5">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-amber-950">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>{currentSection.callout.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">
                      {currentSection.callout.body}
                    </p>
                    <p className="mt-2.5 text-xs font-bold text-emerald-800">
                      Nilai KBC: {currentSection.kbcNote}
                    </p>
                  </div>

                  {/* Interactive Mini Quiz (Cek Pemahaman Singkat) */}
                  <div className="no-print rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                      <HelpCircle className="h-4 w-4" />
                      <span>Cek Pemahaman Singkat (Mengerjakan Modul)</span>
                    </div>
                    <p className="mt-2 text-base font-bold text-slate-900">
                      {currentSection.miniQuiz.question}
                    </p>

                    <div className="mt-3.5 space-y-2.5">
                      {currentSection.miniQuiz.options.map((opt, idx) => {
                        const chosen = quizAnswers[currentSection.slug];
                        const isPicked = chosen === idx;
                        const isCorrect =
                          idx === currentSection.miniQuiz.correctIndex;
                        const hasAnswered = chosen !== undefined;

                        let btnStyle =
                          "border-[#DDD2BE] bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/60";
                        if (hasAnswered && isCorrect) {
                          btnStyle =
                            "border-emerald-500 bg-emerald-100/90 text-emerald-950 font-bold";
                        } else if (hasAnswered && isPicked && !isCorrect) {
                          btnStyle =
                            "border-rose-400 bg-rose-50 text-rose-900 font-bold";
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              handleSelectQuizOption(
                                currentSection.slug,
                                idx,
                                currentSection.miniQuiz.correctIndex
                              )
                            }
                            className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isCorrect && (
                              <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                            )}
                            {hasAnswered && isPicked && !isCorrect && (
                              <X className="h-4 w-4 shrink-0 text-rose-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizAnswers[currentSection.slug] !== undefined && (
                      <div
                        className={`mt-4 rounded-xl px-4 py-3 text-xs font-semibold leading-relaxed ${
                          quizAnswers[currentSection.slug] ===
                          currentSection.miniQuiz.correctIndex
                            ? "bg-emerald-700 text-white"
                            : "bg-amber-100 text-amber-950"
                        }`}
                      >
                        {quizAnswers[currentSection.slug] ===
                        currentSection.miniQuiz.correctIndex
                          ? currentSection.miniQuiz.explanation
                          : "Belum tepat, yuk baca lagi paragraf di atas lalu coba pilih jawaban yang benar!"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chapter Footer Actions */}
                <div className="no-print flex flex-col gap-3 border-t border-[#EFE8DA] bg-[#FCFBF8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  {/* Mark as Read Button */}
                  {(() => {
                    const isRead = Boolean(
                      progressMap.get(currentSection.slug)?.isRead
                    );
                    const isSavingThis = savingSection === currentSection.slug;
                    return (
                      <button
                        type="button"
                        disabled={isSavingThis}
                        onClick={() =>
                          handleMarkRead(currentSection.slug, isRead)
                        }
                        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition ${
                          isRead
                            ? "border border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            : "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {isSavingThis
                            ? "Menyimpan..."
                            : isRead
                              ? "Sudah Selesai Dibaca ✓"
                              : "Tandai Selesai Dibaca"}
                        </span>
                      </button>
                    );
                  })()}

                  {/* Prev / Next Navigation */}
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    {currentSectionIndex > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleTabSwitch(
                            MODULE_SECTIONS[currentSectionIndex - 1].slug
                          )
                        }
                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#DDD2BE] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#FAF7F0]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Sebelumnya</span>
                      </button>
                    )}

                    {currentSectionIndex + 1 < MODULE_SECTIONS.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!progressMap.get(currentSection.slug)?.isRead) {
                            void syncProgressToServer({
                              sectionSlug: currentSection.slug,
                              isRead: true,
                            });
                          }
                          handleTabSwitch(
                            MODULE_SECTIONS[currentSectionIndex + 1].slug
                          );
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-3 text-sm font-extrabold text-white shadow-xs transition hover:bg-amber-700"
                      >
                        <span>Bagian Berikutnya</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!progressMap.get(currentSection.slug)?.isRead) {
                            void syncProgressToServer({
                              sectionSlug: currentSection.slug,
                              isRead: true,
                            });
                          }
                          handleTabSwitch("ulangan");
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:from-amber-700 hover:to-amber-800"
                      >
                        <FileEdit className="h-4 w-4" />
                        <span>Kerjakan Ulangan Harian (5 Uraian)</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
