import { isTeacherAuthenticated } from "@/lib/teacher-auth";
import { TeacherDashboardClient } from "@/components/TeacherDashboardClient";

export const dynamic = "force-dynamic";

export default async function TeacherPanelPage() {
  const authenticated = await isTeacherAuthenticated();
  return <TeacherDashboardClient initialAuthenticated={authenticated} />;
}
