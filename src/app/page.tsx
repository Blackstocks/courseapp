import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronRight,
  Bell,
  Clock,
  FolderOpen,
  Video,
} from "lucide-react";
import { ResourceIcon, resourceBgColor } from "@/components/ui/ResourceIcon";

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
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-gray-500 mt-0.5">
            {formatInTimeZone(now, tz, "EEEE, MMMM d, yyyy")} &middot; {tz}
          </p>
        </div>
      </div>

      {isInstructor ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link
            href="/admin/schedule"
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-4 hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <div className="font-semibold">Schedule a Class</div>
            <div className="text-blue-100 text-sm mt-1">Create a new lesson</div>
          </Link>
          <Link
            href="/admin/lessons"
            className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-4 hover:from-green-700 hover:to-green-800 transition-all"
          >
            <div className="font-semibold">Manage Lessons</div>
            <div className="text-green-100 text-sm mt-1">Add recordings, update status</div>
          </Link>
          <Link
            href="/admin/resources"
            className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-4 hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <div className="font-semibold">Add Resources</div>
            <div className="text-purple-100 text-sm mt-1">Share materials with students</div>
          </Link>
          <Link
            href="/admin/students"
            className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl p-4 hover:from-amber-700 hover:to-amber-800 transition-all"
          >
            <div className="font-semibold">View Students</div>
            <div className="text-amber-100 text-sm mt-1">See enrollments & timezones</div>
          </Link>
          <Link
            href="/admin/extra-class-requests"
            className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-xl p-4 hover:from-teal-700 hover:to-teal-800 transition-all"
          >
            <div className="font-semibold">Extra Class Requests</div>
            <div className="text-teal-100 text-sm mt-1">Review student requests</div>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/extra-class"
            className="group bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 hover:from-green-600 hover:to-green-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap size={20} />
                <div>
                  <div className="font-semibold">Request Extra Class</div>
                  <div className="text-green-100 text-sm mt-0.5">Ask for additional sessions</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-green-200 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <Link
            href="/courses"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen size={20} />
                <div>
                  <div className="font-semibold">My Courses</div>
                  <div className="text-blue-100 text-sm mt-0.5">Browse course materials</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-blue-200 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <Link
            href="/calendar"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon size={20} />
                <div>
                  <div className="font-semibold">Calendar</div>
                  <div className="text-purple-100 text-sm mt-0.5">View upcoming schedule</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-purple-200 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      )}

      {unreadCount > 0 && (
        <Link
          href="/notifications"
          className="group flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 hover:bg-yellow-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-yellow-700" />
          </div>
          <div className="flex-1">
            <div className="text-yellow-800 font-medium">
              You have {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </div>
          </div>
          <ChevronRight size={20} className="text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
            </div>
            <Link href="/calendar" className="text-sm text-blue-600 hover:underline">
              View Calendar
            </Link>
          </div>
          {upcomingLessons.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No upcoming classes this week</p>
            </div>
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
                      className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 whitespace-nowrap"
                    >
                      <Video size={14} />
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
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Resources</h2>
            </div>
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">
              View Courses
            </Link>
          </div>
          {recentResources.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No resources added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className={`w-8 h-8 rounded-lg ${resourceBgColor(resource.type)} flex items-center justify-center flex-shrink-0`}>
                    <ResourceIcon type={resource.type} size={16} />
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
