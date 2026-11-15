"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type SpeechSpeed = 0.85 | 1 | 1.15;

export interface NarrationState {
  supported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  activeIndex: number;
  totalItems: number;
  activeSectionSlug: string | null;
  rate: SpeechSpeed;
  voiceLabel: string;
}

interface SpeakListOptions {
  sectionSlug: string;
  items: string[];
  startIndex?: number;
  onCompleteAll?: () => void;
}

export function useSpeechNarration() {
  const [supported, setSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeSectionSlug, setActiveSectionSlug] = useState<string | null>(null);
  const [rate, setRateState] = useState<SpeechSpeed>(1);
  const [voiceLabel, setVoiceLabel] = useState("Bahasa Indonesia");

  const itemsRef = useRef<string[]>([]);
  const indexRef = useRef<number>(-1);
  const sectionSlugRef = useRef<string | null>(null);
  const rateRef = useRef<SpeechSpeed>(1);
  const onCompleteAllRef = useRef<(() => void) | undefined>(undefined);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const cancelledByUserRef = useRef<boolean>(false);

  // Pick best Indonesian voice available on the device
  const pickVoice = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    const idVoice =
      voices.find((v) => v.lang.toLowerCase() === "id-id" && v.name.toLowerCase().includes("google")) ||
      voices.find((v) => v.lang.toLowerCase() === "id-id") ||
      voices.find((v) => v.lang.toLowerCase().startsWith("id")) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("ms")) ||
      voices[0];

    if (idVoice) {
      voiceRef.current = idVoice;
      setVoiceLabel(idVoice.lang.toLowerCase().startsWith("id") ? `Indonesia (${idVoice.name.split(" ")[0]})` : idVoice.name);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [pickVoice]);

  const speakAtIndex = useCallback((idx: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const list = itemsRef.current;
    if (idx < 0 || idx >= list.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveIndex(-1);
      const cb = onCompleteAllRef.current;
      onCompleteAllRef.current = undefined;
      if (cb) cb();
      return;
    }

    cancelledByUserRef.current = false;
    indexRef.current = idx;
    setActiveIndex(idx);
    setIsPlaying(true);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(list[idx]);
    utterance.lang = "id-ID";
    utterance.rate = rateRef.current;
    utterance.pitch = 1.02;
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onend = () => {
      if (cancelledByUserRef.current) return;
      speakAtIndex(idx + 1);
    };

    utterance.onerror = (event) => {
      if (cancelledByUserRef.current) return;
      if (event.error === "interrupted" || event.error === "canceled") return;
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.cancel();
    // Slight timeout avoids Chrome bug where cancel() swallows the immediate speak()
    setTimeout(() => {
      if (!cancelledByUserRef.current) {
        window.speechSynthesis.speak(utterance);
      }
    }, 35);
  }, []);

  const speakList = useCallback(
    ({ sectionSlug, items, startIndex = 0, onCompleteAll }: SpeakListOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setSupported(false);
        return false;
      }
      if (!items.length) return false;

      pickVoice();
      itemsRef.current = items;
      sectionSlugRef.current = sectionSlug;
      onCompleteAllRef.current = onCompleteAll;
      setActiveSectionSlug(sectionSlug);
      setTotalItems(items.length);
      speakAtIndex(startIndex);
      return true;
    },
    [pickVoice, speakAtIndex]
  );

  const speakSingle = useCallback(
    (text: string, tag = "single") => {
      return speakList({
        sectionSlug: tag,
        items: [text],
        startIndex: 0,
      });
    },
    [speakList]
  );

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else if (indexRef.current >= 0 && itemsRef.current.length > 0) {
      speakAtIndex(indexRef.current);
    }
  }, [speakAtIndex]);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cancelledByUserRef.current = true;
    onCompleteAllRef.current = undefined;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveIndex(-1);
    setTotalItems(0);
    setActiveSectionSlug(null);
    itemsRef.current = [];
    indexRef.current = -1;
  }, []);

  const nextParagraph = useCallback(() => {
    if (indexRef.current + 1 < itemsRef.current.length) {
      cancelledByUserRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        speakAtIndex(indexRef.current + 1);
      }, 40);
    }
  }, [speakAtIndex]);

  const prevParagraph = useCallback(() => {
    if (indexRef.current > 0) {
      cancelledByUserRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        speakAtIndex(indexRef.current - 1);
      }, 40);
    }
  }, [speakAtIndex]);

  const setRate = useCallback(
    (newRate: SpeechSpeed) => {
      rateRef.current = newRate;
      setRateState(newRate);
      if (isPlaying && indexRef.current >= 0 && itemsRef.current.length > 0) {
        cancelledByUserRef.current = true;
        window.speechSynthesis.cancel();
        setTimeout(() => {
          speakAtIndex(indexRef.current);
        }, 50);
      }
    },
    [isPlaying, speakAtIndex]
  );

  return {
    supported,
    isPlaying,
    isPaused,
    activeIndex,
    totalItems,
    activeSectionSlug,
    rate,
    voiceLabel,
    speakList,
    speakSingle,
    pause,
    resume,
    stop,
    nextParagraph,
    prevParagraph,
    setRate,
  };
}
