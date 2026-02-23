"use client";

import { useState } from "react";
import { updateLesson } from "@/actions/lesson.actions";

type Lesson = {
  id: string;
  title: string;
  description: string;
  status: string;
  recordingLink: string;
  meetLink: string;
  scheduledAt: string;
  course: {
    title: string;
    color: string;
  };
};

function toLocalDatetime(utcString: string) {
  const date = new Date(utcString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function LessonManager({ lessons }: { lessons: Lesson[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleUpdate(formData: FormData) {
    setSaving(true);
    setMessage(null);

    // Convert local datetime to UTC before sending to server
    const localDatetime = formData.get("scheduledAt") as string;
    if (localDatetime) {
      formData.set("scheduledAt", new Date(localDatetime).toISOString());
    }

    const result = await updateLesson(formData);
    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Lesson updated successfully!");
      setEditingId(null);
    }
    setSaving(false);
  }

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {message && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
          {message}
        </div>
      )}
      {lessons.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No lessons yet</p>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lesson.course.color }}
                    />
                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        statusColors[lesson.status] || ""
                      }`}
                    >
                      {lesson.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{lesson.course.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(lesson.scheduledAt).toLocaleString()}
                  </p>
                  {lesson.recordingLink && (
                    <a
                      href={lesson.recordingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline mt-1 block"
                    >
                      Recording link
                    </a>
                  )}
                </div>
                <button
                  onClick={() =>
                    setEditingId(editingId === lesson.id ? null : lesson.id)
                  }
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  {editingId === lesson.id ? "Cancel" : "Edit"}
                </button>
              </div>

              {editingId === lesson.id && (
                <form
                  action={handleUpdate}
                  className="mt-4 pt-4 border-t border-gray-100 space-y-3"
                >
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      name="title"
                      type="text"
                      defaultValue={lesson.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={lesson.description}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled At
                    </label>
                    <input
                      name="scheduledAt"
                      type="datetime-local"
                      defaultValue={toLocalDatetime(lesson.scheduledAt)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meet Link
                    </label>
                    <input
                      name="meetLink"
                      type="url"
                      defaultValue={lesson.meetLink}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recording Link
                    </label>
                    <input
                      name="recordingLink"
                      type="url"
                      defaultValue={lesson.recordingLink}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={lesson.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
