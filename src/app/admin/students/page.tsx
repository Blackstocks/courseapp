import { prisma } from "@/lib/prisma";
import StudentList from "@/components/admin/StudentList";

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: {
        include: {
          course: { select: { title: true, color: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    timezone: s.timezone,
    createdAt: s.createdAt.toISOString(),
    enrollments: s.enrollments.map((e) => ({
      courseTitle: e.course.title,
      courseColor: e.course.color,
    })),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Students</h1>
      <StudentList students={serialized} />
    </div>
  );
}
