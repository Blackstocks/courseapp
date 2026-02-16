"use client";

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

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function ExtraClassRequestHistory({
  requests,
}: {
  requests: Request[];
}) {
  if (requests.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No requests yet. Submit your first one above!</p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 truncate">
                  {request.topic}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    statusStyles[request.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
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
                <p className="text-sm text-red-600 mt-1">
                  Reason: {request.rejectionReason}
                </p>
              )}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(request.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
