import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const tz = session.user.timezone || "UTC";
  const isInstructor = session.user.role === "INSTRUCTOR";

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingLessons = await prisma.lesson.findMany({
    where: {
      scheduledAt: { gte: now, lte: nextWeek },
      status: "SCHEDULED",
    },
    include: { course: true },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  const recentResources = await prisma.resource.findMany({
    include: { course: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-gray-500 mt-1">
          {formatInTimeZone(now, tz, "EEEE, MMMM d, yyyy")} &middot; {tz}
        </p>
      </div>

      {isInstructor && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/schedule"
            className="bg-blue-600 text-white rounded-xl p-4 hover:bg-blue-700 transition-colors"
          >
            <div className="font-semibold">Schedule a Class</div>
            <div className="text-blue-100 text-sm mt-1">Create a new lesson</div>
          </Link>
          <Link
            href="/admin/lessons"
            className="bg-green-600 text-white rounded-xl p-4 hover:bg-green-700 transition-colors"
          >
            <div className="font-semibold">Manage Lessons</div>
            <div className="text-green-100 text-sm mt-1">Add recordings, update status</div>
          </Link>
          <Link
            href="/admin/resources"
            className="bg-purple-600 text-white rounded-xl p-4 hover:bg-purple-700 transition-colors"
          >
            <div className="font-semibold">Add Resources</div>
            <div className="text-purple-100 text-sm mt-1">Share materials with students</div>
          </Link>
        </div>
      )}

      {unreadCount > 0 && (
        <Link
          href="/notifications"
          className="block bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 hover:bg-yellow-100 transition-colors"
        >
          <div className="text-yellow-800 font-medium">
            You have {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
            <Link href="/calendar" className="text-sm text-blue-600 hover:underline">
              View Calendar
            </Link>
          </div>
          {upcomingLessons.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming classes this week</p>
          ) : (
            <div className="space-y-3">
              {upcomingLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: lesson.course.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {lesson.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {lesson.course.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {formatInTimeZone(
                        lesson.scheduledAt,
                        tz,
                        "EEE, MMM d 'at' h:mm a"
                      )}
                    </div>
                  </div>
                  {lesson.meetLink && (
                    <a
                      href={lesson.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 whitespace-nowrap"
                    >
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Resources</h2>
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">
              View Courses
            </Link>
          </div>
          {recentResources.length === 0 ? (
            <p className="text-gray-500 text-sm">No resources added yet</p>
          ) : (
            <div className="space-y-3">
              {recentResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                    {resource.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {resource.title}
                    </a>
                    <div className="text-sm text-gray-500">
                      {resource.course.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
