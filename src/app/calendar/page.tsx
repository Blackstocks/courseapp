import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <span className="text-sm text-gray-500">
          Times shown in {session.user.timezone || "UTC"}
        </span>
      </div>
      <CalendarView timezone={session.user.timezone || "UTC"} />
    </div>
  );
}
