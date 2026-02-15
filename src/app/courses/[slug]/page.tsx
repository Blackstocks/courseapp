import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const tz = session.user.timezone || "UTC";

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { scheduledAt: "desc" },
        include: { resources: true },
      },
      resources: {
        where: { lessonId: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) notFound();

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const typeIcons: Record<string, string> = {
    PDF: "PDF",
    LINK: "LINK",
    VIDEO: "VID",
    NOTES: "NOTE",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: course.color }}
        >
          {course.title[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-500">{course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lessons */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lessons</h2>
          {course.lessons.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No lessons scheduled yet
            </div>
          ) : (
            <div className="space-y-3">
              {course.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {lesson.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            statusColors[lesson.status] || ""
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>
                      {lesson.description && (
                        <p className="text-sm text-gray-500 mb-2">
                          {lesson.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-400">
                        {formatInTimeZone(
                          lesson.scheduledAt,
                          tz,
                          "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {lesson.meetLink && (
                        <a
                          href={lesson.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 whitespace-nowrap text-center"
                        >
                          Join Meet
                        </a>
                      )}
                      {lesson.recordingLink && (
                        <a
                          href={lesson.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 whitespace-nowrap text-center"
                        >
                          Recording
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Lesson resources */}
                  {lesson.resources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {lesson.resources.map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm bg-gray-50 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
                          >
                            <span className="text-xs text-gray-400 font-medium">
                              {typeIcons[resource.type] || resource.type}
                            </span>
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Resources (not linked to a lesson) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Course Resources
          </h2>
          {course.resources.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
              No general resources yet
            </div>
          ) : (
            <div className="space-y-2">
              {course.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-500">
                      {typeIcons[resource.type] || resource.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {resource.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatInTimeZone(
                          resource.createdAt,
                          tz,
                          "MMM d, yyyy"
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
