import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import { Globe } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default async function CalendarPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Calendar"
        actions={
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            <Globe size={14} />
            {session.user.timezone || "UTC"}
          </span>
        }
      />
      <CalendarView timezone={session.user.timezone || "UTC"} />
    </div>
  );
}
