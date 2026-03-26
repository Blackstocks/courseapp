"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { logout } from "@/actions/auth.actions";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  Bell,
  ClipboardList,
  BookPlus,
  FolderOpen,
  Users,
  MessageSquareMore,
  LogOut,
} from "lucide-react";

const studentLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/extra-class", label: "Extra Class", icon: GraduationCap, studentOnly: true },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const adminLinks = [
  { href: "/admin/schedule", label: "Schedule", icon: ClipboardList },
  { href: "/admin/lessons", label: "Lessons", icon: BookPlus },
  { href: "/admin/resources", label: "Resources", icon: FolderOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/extra-class-requests", label: "Requests", icon: MessageSquareMore },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const isInstructor = session.user.role === "INSTRUCTOR";
  const initials = (session.user.name || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const visibleStudentLinks = studentLinks.filter(
    (link) => !link.studentOnly || !isInstructor
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="bg-gray-900 text-gray-300 flex flex-col h-full w-64">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-800 flex-shrink-0">
        <Link
          href="/"
          className="text-xl font-bold text-white tracking-tight"
          onClick={onClose}
        >
          CourseApp
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Menu
        </p>
        {visibleStudentLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            >
              <Icon size={20} className={active ? "text-blue-400" : ""} />
              {link.label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}

        {isInstructor && (
          <>
            <div className="border-t border-gray-800 my-4" />
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Admin
            </p>
            {adminLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? "text-purple-400" : ""}
                  />
                  {link.label}
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User profile */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {session.user.name}
            </p>
            {isInstructor && (
              <p className="text-xs text-purple-400">Instructor</p>
            )}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
