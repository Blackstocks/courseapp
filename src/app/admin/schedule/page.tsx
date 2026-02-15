import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ScheduleForm from "@/components/admin/ScheduleForm";

export default async function SchedulePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, color: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Schedule a Class</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ScheduleForm courses={courses} timezone={session.user.timezone || "UTC"} />
      </div>
    </div>
  );
}
