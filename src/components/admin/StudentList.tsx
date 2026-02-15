"use client";

import { useState, useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";

type Student = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  createdAt: string;
  enrollments: {
    courseTitle: string;
    courseColor: string;
  }[];
};

export default function StudentList({ students }: { students: Student[] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (students.length === 0) {
    return <p className="text-gray-500 text-center py-8">No students enrolled yet</p>;
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div
          key={student.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-500">{student.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                {student.timezone} &middot;{" "}
                {formatInTimeZone(now, student.timezone, "h:mm a, MMM d")}
              </p>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              Joined {new Date(student.createdAt).toLocaleDateString()}
            </div>
          </div>
          {student.enrollments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {student.enrollments.map((e) => (
                <span
                  key={e.courseTitle}
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: e.courseColor }}
                >
                  {e.courseTitle}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
