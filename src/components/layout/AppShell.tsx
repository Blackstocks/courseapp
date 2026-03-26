"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/courses": "Courses",
  "/calendar": "Calendar",
  "/extra-class": "Extra Class",
  "/notifications": "Notifications",
  "/admin/schedule": "Schedule",
  "/admin/lessons": "Lessons",
  "/admin/resources": "Resources",
  "/admin/students": "Students",
  "/admin/extra-class-requests": "Requests",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/courses/")) return "Course Details";
  return "";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // No shell for unauthenticated pages (login, register)
  if (status === "loading" || !session) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden animate-slide-in-left">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg font-bold text-blue-600 md:hidden">
              CourseApp
            </span>
            {pageTitle && (
              <h1 className="text-lg font-semibold text-gray-900 hidden md:block">
                {pageTitle}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
