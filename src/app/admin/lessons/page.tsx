import { prisma } from "@/lib/prisma";
import LessonManager from "@/components/admin/LessonManager";

export default async function LessonsPage() {
  const lessons = await prisma.lesson.findMany({
    include: {
      course: { select: { title: true, color: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const serialized = lessons.map((l) => ({
    ...l,
    scheduledAt: l.scheduledAt.toISOString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Lessons</h1>
      <LessonManager lessons={serialized} />
    </div>
  );
}
