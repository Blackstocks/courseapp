"use client";

import { useState } from "react";
import { scheduleLesson } from "@/actions/lesson.actions";

type Course = {
  id: string;
  title: string;
  color: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getNextDayDate(dayIndex: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntil = (dayIndex - currentDay + 7) % 7 || 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  const yyyy = nextDate.getFullYear();
  const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
  const dd = String(nextDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ScheduleForm({
  courses,
  timezone,
}: {
  courses: Course[];
  timezone: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  function handleDayClick(dayIndex: number) {
    setSelectedDay(dayIndex);
    setDate(getNextDayDate(dayIndex));
  }

  async function handleSubmit(formData: FormData) {
    if (!date || !time) {
      setError("Date and time are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const meetLink = (formData.get("meetLink") as string) || "";

    let created = 0;

    for (let week = 0; week < repeatWeeks; week++) {
      const baseDate = new Date(`${date}T${time}`);
      baseDate.setDate(baseDate.getDate() + week * 7);
      const utcISO = baseDate.toISOString();

      const weekFormData = new FormData();
      weekFormData.set("courseId", courseId);
      weekFormData.set("title", title);
      weekFormData.set("description", description);
      weekFormData.set("meetLink", meetLink);
      weekFormData.set("scheduledAt", utcISO);

      const result = await scheduleLesson(weekFormData);
      if (result?.error) {
        setError(
          result.error +
            (created > 0
              ? ` (${created} lesson${created > 1 ? "s" : ""} were created before this error)`
              : "")
        );
        setLoading(false);
        return;
      }
      created++;
    }

    setSuccess(
      created === 1
        ? "Lesson scheduled! Students have been notified."
        : `${created} lessons scheduled across ${created} weeks! Students have been notified.`
    );
    setRepeatWeeks(1);
    setSelectedDay(null);
    setDate("");
    setTime("");
    const form = document.getElementById("schedule-form") as HTMLFormElement;
    form?.reset();
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
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="courseId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Pick Day
        </label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                selectedDay === i
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Picks the next occurrence of that day
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedDay(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time
          </label>
          <input
            id="time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-4">
        Your timezone: {timezone}. Students see it converted to theirs.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Repeat Weekly
        </label>
        <div className="flex items-center gap-3">
          <select
            value={repeatWeeks}
            onChange={(e) => setRepeatWeeks(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>No repeat (1 lesson)</option>
            <option value={2}>2 weeks</option>
            <option value={3}>3 weeks</option>
            <option value={4}>4 weeks</option>
            <option value={6}>6 weeks</option>
            <option value={8}>8 weeks</option>
            <option value={12}>12 weeks</option>
          </select>
          {repeatWeeks > 1 && (
            <span className="text-sm text-gray-500">
              Same day & time for {repeatWeeks} consecutive weeks
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="meetLink"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
        {loading
          ? "Scheduling..."
          : repeatWeeks > 1
            ? `Schedule ${repeatWeeks} Lessons`
            : "Schedule Lesson"}
      </button>
    </form>
  );
}
