import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, FolderOpen } from "lucide-react";

export default async function CoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { lessons: true, resources: true },
      },
    },
    orderBy: { title: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-hover"
          >
            <div
              className="h-1.5"
              style={{ backgroundColor: course.color }}
            />
            <div className="p-6">
              <div
                className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: course.color }}
              >
                {course.title[0]}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{course.description}</p>
              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} />
                  {course._count.lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <FolderOpen size={14} />
                  {course._count.resources} resources
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
