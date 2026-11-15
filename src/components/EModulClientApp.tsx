"use client";

import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { StudentEntryView } from "@/components/StudentEntryView";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import type {
  StudentRecord,
  ProgressRecord,
  ExamSubmissionRecord,
  StudentSessionResponse,
} from "@/types/emodul";

const STORAGE_KEY = "ski_k4_mi_sirojul_huda_student_id";

export function EModulClientApp() {
  const [initializing, setInitializing] = useState(true);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [submission, setSubmission] = useState<ExamSubmissionRecord | null>(null);
  const [autoStartListen, setAutoStartListen] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedId = window.localStorage.getItem(STORAGE_KEY);
        if (!savedId) {
          setInitializing(false);
          return;
        }
        const res = await fetch(`/api/students/${savedId}`);
        if (!res.ok) {
          window.localStorage.removeItem(STORAGE_KEY);
          setInitializing(false);
          return;
        }
        const data = (await res.json()) as StudentSessionResponse;
        setStudent(data.student);
        setProgress(data.progress ?? []);
        setSubmission(data.submission ?? null);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setInitializing(false);
      }
    }

    void restoreSession();
  }, []);

  function handleLoginSuccess(data: StudentSessionResponse, autoListen = false) {
    setStudent(data.student);
    setProgress(data.progress ?? []);
    setSubmission(data.submission ?? null);
    setAutoStartListen(autoListen);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(data.student.id));
    } catch {
      // Ignore storage quota errors
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSwitchStudent() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setStudent(null);
    setProgress([]);
    setSubmission(null);
    setAutoStartListen(false);
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F0] px-4">
        <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
          <BookOpen className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm font-bold text-emerald-900">
          Memuat E-Modul SKI Kelas 4 MI Sirojul Huda...
        </p>
      </div>
    );
  }

  if (!student) {
    return <StudentEntryView onSuccess={handleLoginSuccess} />;
  }

  return (
    <ModuleWorkspace
      student={student}
      progress={progress}
      submission={submission}
      autoStartListen={autoStartListen}
      onUpdateStudent={setStudent}
      onUpdateProgress={setProgress}
      onUpdateSubmission={setSubmission}
      onSwitchStudent={handleSwitchStudent}
    />
  );
}
