"use client";

import { markNotificationRead, markAllNotificationsRead } from "@/actions/notification.actions";
import Link from "next/link";

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  link: string;
  createdAt: string;
};

export default function NotificationFeed({
  notifications,
  hasUnread,
}: {
  notifications: Notification[];
  hasUnread: boolean;
}) {
  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
  }

  const typeColors: Record<string, string> = {
    LESSON_SCHEDULED: "bg-blue-100 text-blue-700",
    RESOURCE_ADDED: "bg-purple-100 text-purple-700",
    LESSON_UPDATED: "bg-green-100 text-green-700",
  };

  return (
    <div>
      {hasUnread && (
        <div className="flex justify-end mb-4">
          <form action={handleMarkAllRead}>
            <button
              type="submit"
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </form>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-4 transition-colors ${
                notification.read
                  ? "border-gray-200"
                  : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        typeColors[notification.type] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {notification.type.replaceAll("_", " ")}
                    </span>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-900">{notification.message}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                    >
                      View
                    </Link>
                  )}
                  {!notification.read && (
                    <form action={() => handleMarkRead(notification.id)}>
                      <button
                        type="submit"
                        className="text-sm text-gray-400 hover:text-gray-600 whitespace-nowrap"
                      >
                        Mark read
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
