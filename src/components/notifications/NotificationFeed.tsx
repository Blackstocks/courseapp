"use client";

import { markNotificationRead, markAllNotificationsRead } from "@/actions/notification.actions";
import Link from "next/link";
import {
  CalendarPlus,
  FolderPlus,
  CalendarCheck,
  Hand,
  CheckCircle2,
  XCircle,
  CheckCheck,
  ArrowRight,
  BellOff,
} from "lucide-react";

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  link: string;
  createdAt: string;
};

const typeConfig: Record<
  string,
  { icon: React.ElementType; bg: string; color: string }
> = {
  LESSON_SCHEDULED: { icon: CalendarPlus, bg: "bg-blue-100", color: "text-blue-600" },
  RESOURCE_ADDED: { icon: FolderPlus, bg: "bg-purple-100", color: "text-purple-600" },
  LESSON_UPDATED: { icon: CalendarCheck, bg: "bg-green-100", color: "text-green-600" },
  EXTRA_CLASS_REQUESTED: { icon: Hand, bg: "bg-yellow-100", color: "text-yellow-600" },
  EXTRA_CLASS_APPROVED: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  EXTRA_CLASS_REJECTED: { icon: XCircle, bg: "bg-red-100", color: "text-red-600" },
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

  return (
    <div>
      {hasUnread && (
        <div className="flex justify-end mb-4">
          <form action={handleMarkAllRead}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </form>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <BellOff size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-900 font-medium">No notifications yet</p>
          <p className="text-gray-500 text-sm mt-1">
            You&apos;ll be notified about new lessons, resources, and more
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config?.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${
                  notification.read
                    ? "border-gray-200"
                    : "border-blue-200 bg-blue-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {config && Icon && (
                    <div
                      className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <Icon size={18} className={config.color} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap"
                      >
                        View
                        <ArrowRight size={14} />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
