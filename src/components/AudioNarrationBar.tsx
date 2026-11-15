"use client";

import React from "react";
import {
  Headphones,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
} from "lucide-react";
import type { SpeechSpeed } from "@/hooks/useSpeechNarration";

interface AudioNarrationBarProps {
  supported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  activeIndex: number;
  totalItems: number;
  sectionTitle: string;
  rate: SpeechSpeed;
  autoAdvance: boolean;
  onToggleAutoAdvance: () => void;
  onPlaySection: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onChangeRate: (rate: SpeechSpeed) => void;
}

const SPEED_OPTIONS: { value: SpeechSpeed; label: string }[] = [
  { value: 0.85, label: "0.85x" },
  { value: 1, label: "1.0x" },
  { value: 1.15, label: "1.15x" },
];

export function AudioNarrationBar({
  supported,
  isPlaying,
  isPaused,
  activeIndex,
  totalItems,
  sectionTitle,
  rate,
  autoAdvance,
  onToggleAutoAdvance,
  onPlaySection,
  onPause,
  onResume,
  onStop,
  onPrev,
  onNext,
  onChangeRate,
}: AudioNarrationBarProps) {
  const isActive = isPlaying || isPaused;

  if (!supported) {
    return (
      <div className="no-print mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex items-center gap-2 font-bold">
          <Volume2 className="h-4 w-4 text-amber-700" />
          <span>Browser belum mendukung suara otomatis (Web Speech API)</span>
        </div>
        <p className="mt-1 text-xs text-amber-800">
          Gunakan Google Chrome atau Microsoft Edge agar fitur Belajar dengan Mendengarkan dapat membacakan materi dengan suara Bahasa Indonesia.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`no-print sticky top-[68px] z-20 mb-6 rounded-2xl border transition-all ${
        isActive
          ? "border-emerald-600/40 bg-gradient-to-r from-[#0B3D26] via-[#0F5132] to-[#146542] text-white shadow-lg shadow-emerald-950/15"
          : "border-amber-300/80 bg-gradient-to-r from-amber-50 via-[#FFFBF0] to-emerald-50 text-slate-900 shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {/* Left: Status & Animated Wave */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isActive
                ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-300/40"
                : "bg-emerald-700 text-white shadow-xs"
            }`}
          >
            {isPlaying ? (
              <div className="flex h-5 items-end gap-1" aria-hidden="true">
                <span className="animate-wave-1 h-4 w-1 rounded-full bg-amber-300" />
                <span className="animate-wave-2 h-5 w-1 rounded-full bg-amber-300" />
                <span className="animate-wave-3 h-3 w-1 rounded-full bg-amber-300" />
                <span className="animate-wave-4 h-4 w-1 rounded-full bg-amber-300" />
              </div>
            ) : (
              <Headphones className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  isActive ? "text-amber-300" : "text-emerald-800"
                }`}
              >
                {isPlaying
                  ? "Sedang Membacakan Materi"
                  : isPaused
                    ? "Audio Dijeda"
                    : "Mode Belajar dengan Mendengarkan"}
              </span>
              {isActive && totalItems > 0 && activeIndex >= 0 && (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  Paragraf {activeIndex + 1} / {totalItems}
                </span>
              )}
            </div>
            <p
              className={`truncate text-sm font-bold ${
                isActive ? "text-white" : "text-slate-800"
              }`}
            >
              {sectionTitle}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isActive ? (
            <button
              type="button"
              onClick={onPlaySection}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Belajar dengan Mendengarkan</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onPrev}
                disabled={activeIndex <= 0}
                title="Paragraf Sebelumnya"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              {isPlaying ? (
                <button
                  type="button"
                  onClick={onPause}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-emerald-950 shadow-xs transition hover:bg-amber-300"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Jeda</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onResume}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-emerald-950 shadow-xs transition hover:bg-amber-300"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Lanjut</span>
                </button>
              )}

              <button
                type="button"
                onClick={onNext}
                disabled={activeIndex + 1 >= totalItems}
                title="Paragraf Berikutnya"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onStop}
                title="Berhenti"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-rose-500/80 text-white transition hover:bg-rose-500"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            </>
          )}

          {/* Speed selector */}
          <div
            className={`inline-flex items-center rounded-lg p-0.5 text-xs font-bold ${
              isActive
                ? "bg-black/25 text-white"
                : "border border-[#E5DCCB] bg-white text-slate-700"
            }`}
          >
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeRate(opt.value)}
                className={`cursor-pointer rounded-md px-2 py-1 transition ${
                  rate === opt.value
                    ? isActive
                      ? "bg-amber-400 text-emerald-950"
                      : "bg-emerald-700 text-white"
                    : isActive
                      ? "text-emerald-100 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Continuous auto-advance toggle */}
          <button
            type="button"
            onClick={onToggleAutoAdvance}
            title="Otomatis lanjut ke bagian berikutnya saat audio selesai"
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
              autoAdvance
                ? isActive
                  ? "bg-emerald-400/25 text-emerald-100 ring-1 ring-emerald-300/50"
                  : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                : isActive
                  ? "bg-white/10 text-emerald-200/75 hover:bg-white/15"
                  : "border border-[#E5DCCB] bg-white text-slate-500 hover:text-slate-800"
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {autoAdvance ? "Lanjut Otomatis: Aktif" : "Lanjut Otomatis"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
