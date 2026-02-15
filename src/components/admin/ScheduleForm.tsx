"use client";

import { useState } from "react";
import { scheduleLesson } from "@/actions/lesson.actions";

type Course = {
  id: string;
  title: string;
  color: string;
};

export default function ScheduleForm({
  courses,
  timezone,
}: {
  courses: Course[];
  timezone: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // datetime-local gives "2024-01-15T14:00" (no timezone info).
    // The browser's Date constructor interprets this as browser-local time.
    // .toISOString() converts it to UTC — exactly what we need to store.
    const localDatetime = formData.get("scheduledAt") as string;
    if (localDatetime) {
      const utcISO = new Date(localDatetime).toISOString();
      formData.set("scheduledAt", utcISO);
    }

    const result = await scheduleLesson(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      const form = document.getElementById("schedule-form") as HTMLFormElement;
      form?.reset();
    }
    setLoading(false);
  }

  return (
    <form id="schedule-form" action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
          Lesson scheduled successfully! Students have been notified.
        </div>
      )}

      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
          Course
        </label>
        <select
          id="courseId"
          name="courseId"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Lesson Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., React Hooks Deep Dive"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What will be covered in this lesson"
        />
      </div>

      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time
        </label>
        <input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Shown in your timezone ({timezone}). Students will see it converted to their timezone.
        </p>
      </div>

      <div>
        <label htmlFor="meetLink" className="block text-sm font-medium text-gray-700 mb-1">
          Google Meet Link
        </label>
        <input
          id="meetLink"
          name="meetLink"
          type="url"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://meet.google.com/abc-defg-hij"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? "Scheduling..." : "Schedule Lesson"}
      </button>
    </form>
  );
}
