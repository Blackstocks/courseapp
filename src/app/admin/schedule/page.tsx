import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ScheduleForm from "@/components/admin/ScheduleForm";
import PageHeader from "@/components/layout/PageHeader";

export default async function SchedulePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, color: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Schedule a Class" />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ScheduleForm courses={courses} timezone={session.user.timezone || "UTC"} />
      </div>
    </div>
  );
}
