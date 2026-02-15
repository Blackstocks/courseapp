"use client";

import { useState } from "react";
import { addResource } from "@/actions/resource.actions";

type Course = {
  id: string;
  title: string;
};

type Lesson = {
  id: string;
  title: string;
  courseId: string;
};

export default function ResourceForm({
  courses,
  lessons,
}: {
  courses: Course[];
  lessons: Lesson[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const filteredLessons = lessons.filter((l) => l.courseId === selectedCourseId);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await addResource(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      const form = document.getElementById("resource-form") as HTMLFormElement;
      form?.reset();
      setSelectedCourseId("");
    }
    setLoading(false);
  }

  return (
    <form id="resource-form" action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
          Resource added successfully! Students have been notified.
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
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
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
        <label htmlFor="lessonId" className="block text-sm font-medium text-gray-700 mb-1">
          Lesson (optional - attach to a specific lesson)
        </label>
        <select
          id="lessonId"
          name="lessonId"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">General course resource</option>
          {filteredLessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Resource Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Lecture Slides Week 1"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          id="type"
          name="type"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select type</option>
          <option value="PDF">PDF</option>
          <option value="LINK">Link</option>
          <option value="VIDEO">Video</option>
          <option value="NOTES">Notes</option>
        </select>
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://drive.google.com/..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? "Adding..." : "Add Resource"}
      </button>
    </form>
  );
}
