import { db } from "@/db";
import { students, readingProgress, examSubmissions } from "@/db/schema";
import { sql } from "drizzle-orm";

let seededPromise: Promise<void> | null = null;

async function runSeedIfEmpty() {
  const countRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students);

  if ((countRes[0]?.count ?? 0) > 0) {
    return;
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000);
  const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000);

  // Sample Student 1: Completed all 5 sections with audio & graded exam
  const [s1] = await db
    .insert(students)
    .values({
      fullName: "Aisyah Rahmadhani",
      className: "Kelas 4A",
      absenNumber: "03",
      usedAudio: true,
      audioMinutes: 14,
      joinedAt: twoHoursAgo,
      lastActiveAt: oneHourAgo,
    })
    .returning();

  await db.insert(readingProgress).values([
    { studentId: s1.id, sectionSlug: "bagian-1", isRead: true, listenedAudio: true, completedAt: twoHoursAgo },
    { studentId: s1.id, sectionSlug: "bagian-2", isRead: true, listenedAudio: true, completedAt: twoHoursAgo },
    { studentId: s1.id, sectionSlug: "bagian-3", isRead: true, listenedAudio: true, completedAt: oneHourAgo },
    { studentId: s1.id, sectionSlug: "bagian-4", isRead: true, listenedAudio: true, completedAt: oneHourAgo },
    { studentId: s1.id, sectionSlug: "bagian-5", isRead: true, listenedAudio: true, completedAt: oneHourAgo },
  ]);

  await db.insert(examSubmissions).values({
    studentId: s1.id,
    answer1:
      "Rasulullah SAW memerintahkan sahabat hijrah ke Habasyah karena siksaan dan penindasan kaum kafir Quraisy di Makkah sangat berat, agar iman dan keselamatan para sahabat tetap terjaga.",
    answer2:
      "Rasulullah memilih Habasyah karena dipimpin oleh Raja Najasyi yang terkenal sangat adil, jujur, bijaksana, dan tidak membiarkan seorang pun dizalimi di negerinya.",
    answer3:
      "Gelombang pertama dipimpin Utsman bin Affan dan Ruqayyah dengan sekitar 11-12 laki-laki dan 4 perempuan. Gelombang kedua dipimpin Ja'far bin Abi Thalib dengan jumlah lebih besar yaitu 83 laki-laki dan 18 perempuan.",
    answer4:
      "Ja'far bin Abi Thalib berbicara dengan tenang, jujur, dan sopan menjelaskan ajaran Islam yang mulia, lalu membacakan awal Surah Maryam sampai Raja Najasyi terharu dan melindungi kaum muslimin.",
    answer5:
      "Kita harus meneladani kesabaran dan rajin salat sebagai cinta kepada Allah, selalu berkata jujur kepada guru dan orang tua, serta menghormati semua teman di MI Sirojul Huda.",
    status: "graded",
    score1: 19,
    score2: 20,
    score3: 19,
    score4: 19,
    score5: 19,
    totalScore: 96,
    teacherFeedback:
      "MasyaAllah, jawaban Aisyah sangat lengkap, runtut, dan mencerminkan nilai Kurikulum Berbasis Cinta. Pertahankan semangat belajarmu, Nak!",
    submittedAt: oneHourAgo,
    gradedAt: halfHourAgo,
    updatedAt: halfHourAgo,
  });

  // Sample Student 2: Finished reading 5/5 & submitted exam (waiting for teacher grading)
  const [s2] = await db
    .insert(students)
    .values({
      fullName: "Muhammad Rayhan Pratama",
      className: "Kelas 4A",
      absenNumber: "12",
      usedAudio: true,
      audioMinutes: 10,
      joinedAt: oneHourAgo,
      lastActiveAt: halfHourAgo,
    })
    .returning();

  await db.insert(readingProgress).values([
    { studentId: s2.id, sectionSlug: "bagian-1", isRead: true, listenedAudio: true, completedAt: oneHourAgo },
    { studentId: s2.id, sectionSlug: "bagian-2", isRead: true, listenedAudio: true, completedAt: oneHourAgo },
    { studentId: s2.id, sectionSlug: "bagian-3", isRead: true, listenedAudio: false, completedAt: halfHourAgo },
    { studentId: s2.id, sectionSlug: "bagian-4", isRead: true, listenedAudio: true, completedAt: halfHourAgo },
    { studentId: s2.id, sectionSlug: "bagian-5", isRead: true, listenedAudio: false, completedAt: halfHourAgo },
  ]);

  await db.insert(examSubmissions).values({
    studentId: s2.id,
    answer1:
      "Karena kaum muslimin disiksa dan ditekan oleh orang kafir Quraisy di Makkah sehingga perlu tempat aman untuk beribadah kepada Allah SWT.",
    answer2:
      "Karena Raja Najasyi adalah raja yang adil dan melindungi rakyatnya serta tidak menzalimi siapa pun.",
    answer3:
      "Gelombang pertama dipimpin Utsman bin Affan jumlahnya sekitar 15 orang. Gelombang kedua dipimpin Ja'far bin Abi Thalib jumlahnya lebih dari 100 orang.",
    answer4:
      "Ja'far menjelaskan tentang ajaran Nabi Muhammad SAW dengan berani dan jujur lalu membacakan Surah Maryam di hadapan Raja Najasyi.",
    answer5:
      "Sabar saat belajar, berani berkata jujur, dan saling menghormati antar teman di sekolah maupun di rumah.",
    status: "submitted",
    submittedAt: halfHourAgo,
    updatedAt: halfHourAgo,
  });

  // Sample Student 3: Currently reading (3/5 sections)
  const [s3] = await db
    .insert(students)
    .values({
      fullName: "Zahra Nabila Putri",
      className: "Kelas 4B",
      absenNumber: "08",
      usedAudio: false,
      audioMinutes: 0,
      joinedAt: halfHourAgo,
      lastActiveAt: now,
    })
    .returning();

  await db.insert(readingProgress).values([
    { studentId: s3.id, sectionSlug: "bagian-1", isRead: true, listenedAudio: false, completedAt: halfHourAgo },
    { studentId: s3.id, sectionSlug: "bagian-2", isRead: true, listenedAudio: false, completedAt: now },
    { studentId: s3.id, sectionSlug: "bagian-3", isRead: true, listenedAudio: false, completedAt: now },
  ]);
}

export async function ensureSeeded(): Promise<void> {
  if (!seededPromise) {
    seededPromise = runSeedIfEmpty().catch((err) => {
      seededPromise = null;
      console.error("Seed error:", err);
    });
  }
  await seededPromise;
}
