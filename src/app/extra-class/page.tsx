import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExtraClassRequestForm from "@/components/extra-class/ExtraClassRequestForm";
import ExtraClassRequestHistory from "@/components/extra-class/ExtraClassRequestHistory";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Extra Class</h1>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <>
          <div className="mb-8">
            <ExtraClassRequestForm courses={courses} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Requests</h2>
          <ExtraClassRequestHistory requests={serializedRequests} />
        </>
      )}
    </div>
  );
}
