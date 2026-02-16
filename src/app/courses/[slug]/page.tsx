import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  PlayCircle,
  BookOpen,
  FolderOpen,
  CalendarDays,
} from "lucide-react";
import { ResourceIcon, resourceBgColor } from "@/components/ui/ResourceIcon";

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

  const statusConfig: Record<
    string,
    { class: string; icon: React.ElementType; label: string; border: string }
  > = {
    SCHEDULED: {
      class: "bg-blue-100 text-blue-700",
      icon: Clock,
      label: "Scheduled",
      border: "border-l-blue-400",
    },
    COMPLETED: {
      class: "bg-green-100 text-green-700",
      icon: CheckCircle2,
      label: "Completed",
      border: "border-l-green-400",
    },
    CANCELLED: {
      class: "bg-red-100 text-red-700",
      icon: XCircle,
      label: "Cancelled",
      border: "border-l-red-400",
    },
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
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
          </div>
          {course.lessons.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <CalendarDays size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No lessons scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.lessons.map((lesson) => {
                const config = statusConfig[lesson.status];
                const StatusIcon = config?.icon;
                return (
                  <div
                    key={lesson.id}
                    className={`bg-white rounded-xl border border-gray-200 p-4 border-l-4 ${
                      config?.border || ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {lesson.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              config?.class || ""
                            }`}
                          >
                            {StatusIcon && <StatusIcon size={12} />}
                            {config?.label || lesson.status}
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
                            className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 whitespace-nowrap text-center"
                          >
                            <Video size={14} />
                            Join Meet
                          </a>
                        )}
                        {lesson.recordingLink && (
                          <a
                            href={lesson.recordingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 whitespace-nowrap text-center"
                          >
                            <PlayCircle size={14} />
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
                              <ResourceIcon type={resource.type} size={14} />
                              {resource.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Resources (not linked to a lesson) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={18} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Course Resources
            </h2>
          </div>
          {course.resources.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <FolderOpen size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No general resources yet</p>
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
                    <div
                      className={`w-8 h-8 rounded-lg ${resourceBgColor(
                        resource.type
                      )} flex items-center justify-center flex-shrink-0`}
                    >
                      <ResourceIcon type={resource.type} size={16} />
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
