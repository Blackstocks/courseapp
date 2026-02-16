"use client";

import { useState } from "react";
import { submitExtraClassRequest } from "@/actions/extraClass.actions";
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  Clock,
  MessageSquare,
  AlignLeft,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  color: string;
};

export default function ExtraClassRequestForm({
  courses,
}: {
  courses: Course[];
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await submitExtraClassRequest(formData);
    setLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Request submitted! The instructor will review it." });
      // Reset form
      const form = document.getElementById("extra-class-form") as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <form id="extra-class-form" action={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={20} className="text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Request an Extra Class</h2>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={16} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="courseId" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <BookOpen size={14} className="text-gray-400" />
              Course
            </label>
            <select
              name="courseId"
              id="courseId"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="preferredDate" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <CalendarDays size={14} className="text-gray-400" />
                Preferred Date
              </label>
              <input
                type="date"
                name="preferredDate"
                id="preferredDate"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="availableFrom" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Clock size={14} className="text-gray-400" />
                Available From
              </label>
              <input
                type="time"
                name="availableFrom"
                id="availableFrom"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="availableTo" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Clock size={14} className="text-gray-400" />
                Available To
              </label>
              <input
                type="time"
                name="availableTo"
                id="availableTo"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="topic" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <MessageSquare size={14} className="text-gray-400" />
              Topic
            </label>
            <input
              type="text"
              name="topic"
              id="topic"
              required
              placeholder="What would you like to learn?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <AlignLeft size={14} className="text-gray-400" />
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Any additional details about what you'd like to cover..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <Send size={16} />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
