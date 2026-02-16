"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { logout } from "@/actions/auth.actions";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  ClipboardList,
  BookPlus,
  FolderOpen,
  Users,
  MessageSquareMore,
  LogOut,
} from "lucide-react";

const navIconMap: Record<string, React.ElementType> = {
  "/": LayoutDashboard,
  "/courses": BookOpen,
  "/calendar": Calendar,
  "/extra-class": GraduationCap,
};

const adminIconMap: Record<string, React.ElementType> = {
  "/admin/schedule": ClipboardList,
  "/admin/lessons": BookPlus,
  "/admin/resources": FolderOpen,
  "/admin/students": Users,
  "/admin/extra-class-requests": MessageSquareMore,
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const isInstructor = session.user.role === "INSTRUCTOR";

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/courses", label: "Courses" },
    { href: "/calendar", label: "Calendar" },
    ...(!isInstructor
      ? [{ href: "/extra-class", label: "Extra Class" }]
      : []),
  ];

  const adminLinks = [
    { href: "/admin/schedule", label: "Schedule" },
    { href: "/admin/lessons", label: "Lessons" },
    { href: "/admin/resources", label: "Resources" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/extra-class-requests", label: "Requests" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              CourseApp
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const activeClass =
                  link.href === "/extra-class"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700";
                const Icon = navIconMap[link.href];
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? activeClass
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {Icon && <Icon size={16} />}
                    {link.label}
                  </Link>
                );
              })}
              {isInstructor && (
                <>
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  {adminLinks.map((link) => {
                    const Icon = adminIconMap[link.href];
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname === link.href
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {Icon && <Icon size={16} />}
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span>{session.user.name}</span>
              {isInstructor && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                  Instructor
                </span>
              )}
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const activeClass =
              link.href === "/extra-class"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700";
            const Icon = navIconMap[link.href];
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? activeClass
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon size={16} />}
                {link.label}
              </Link>
            );
          })}
          {isInstructor &&
            adminLinks.map((link) => {
              const Icon = adminIconMap[link.href];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    pathname === link.href
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {link.label}
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
}
