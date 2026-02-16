"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle, Inbox } from "lucide-react";

type Request = {
  id: string;
  topic: string;
  description: string;
  preferredDate: string;
  availableFrom: string;
  availableTo: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
  course: {
    title: string;
    color: string;
  };
};

const statusConfig: Record<
  string,
  { icon: React.ElementType; class: string; border: string }
> = {
  PENDING: { icon: Clock, class: "bg-yellow-100 text-yellow-700", border: "border-l-yellow-400" },
  APPROVED: { icon: CheckCircle2, class: "bg-green-100 text-green-700", border: "border-l-green-400" },
  REJECTED: { icon: XCircle, class: "bg-red-100 text-red-700", border: "border-l-red-400" },
};

export default function ExtraClassRequestHistory({
  requests,
}: {
  requests: Request[];
}) {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Inbox size={32} className="text-gray-300 mx-auto mb-2" />
        <p className="text-gray-900 font-medium">No requests yet</p>
        <p className="text-gray-500 text-sm mt-1">Submit your first one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        const StatusIcon = config?.icon;
        return (
          <div
            key={request.id}
            className={`bg-white rounded-xl border border-gray-200 p-4 border-l-4 ${
              config?.border || ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {request.topic}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      config?.class || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {StatusIcon && <StatusIcon size={12} />}
                    {request.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {request.course.title} &middot;{" "}
                  {new Date(request.preferredDate).toLocaleDateString()} &middot;{" "}
                  {request.availableFrom} - {request.availableTo}
                </div>
                {request.description && (
                  <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                )}
                {request.status === "REJECTED" && request.rejectionReason && (
                  <p className="flex items-center gap-1.5 text-sm text-red-600 mt-1">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    Reason: {request.rejectionReason}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
