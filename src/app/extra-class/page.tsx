import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExtraClassRequestForm from "@/components/extra-class/ExtraClassRequestForm";
import ExtraClassRequestHistory from "@/components/extra-class/ExtraClassRequestHistory";
import { GraduationCap, History } from "lucide-react";

export default async function ExtraClassPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/");

  // Get courses the student is enrolled in
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { id: true, title: true, color: true } } },
  });

  const courses = enrollments.map((e) => e.course);

  // Get past requests
  const requests = await prisma.extraClassRequest.findMany({
    where: { studentId: session.user.id },
    include: { course: { select: { title: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });

  const serializedRequests = requests.map((r) => ({
    ...r,
    preferredDate: r.preferredDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={20} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Extra Class</h1>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <>
          <div className="mb-8">
            <ExtraClassRequestForm courses={courses} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
          </div>
          <ExtraClassRequestHistory requests={serializedRequests} />
        </>
      )}
    </div>
  );
}
