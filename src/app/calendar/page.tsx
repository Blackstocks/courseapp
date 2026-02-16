import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import { Calendar, Globe } from "lucide-react";

export default async function CalendarPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          <Globe size={14} />
          {session.user.timezone || "UTC"}
        </span>
      </div>
      <CalendarView timezone={session.user.timezone || "UTC"} />
    </div>
  );
}
