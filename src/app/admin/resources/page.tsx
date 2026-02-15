import { prisma } from "@/lib/prisma";
import ResourceForm from "@/components/admin/ResourceForm";

export default async function ResourcesPage() {
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const lessons = await prisma.lesson.findMany({
    select: { id: true, title: true, courseId: true },
    orderBy: { scheduledAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Resource</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ResourceForm courses={courses} lessons={lessons} />
      </div>
    </div>
  );
}
