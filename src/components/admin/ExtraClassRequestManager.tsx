"use client";

import { useState } from "react";
import {
  approveExtraClassRequest,
  rejectExtraClassRequest,
} from "@/actions/extraClass.actions";

type Request = {
  id: string;
  topic: string;
  description: string;
  preferredDate: string;
  availableFrom: string;
  availableTo: string;
  status: string;
  rejectionReason: string;
  lessonId: string | null;
  createdAt: string;
  student: { id: string; name: string; email: string };
  course: { id: string; title: string; color: string; slug: string };
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const tabs = ["All", "Pending", "Approved", "Rejected"] as const;

export default function ExtraClassRequestManager({
  requests,
}: {
  requests: Request[];
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered =
    activeTab === "All"
      ? requests
      : requests.filter((r) => r.status === activeTab.toUpperCase());

  function getDefaultScheduledAt(request: Request) {
    const date = request.preferredDate.split("T")[0];
    return `${date}T${request.availableFrom}`;
  }

  async function handleApprove(formData: FormData) {
    const requestId = formData.get("requestId") as string;
    setLoadingId(requestId);
    setMessage(null);
    const result = await approveExtraClassRequest(formData);
    setLoadingId(null);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Request approved and lesson scheduled!" });
      setExpandedId(null);
    }
  }

  async function handleReject(formData: FormData) {
    const requestId = formData.get("requestId") as string;
    setLoadingId(requestId);
    setMessage(null);
    const result = await rejectExtraClassRequest(formData);
    setLoadingId(null);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Request rejected." });
      setExpandedId(null);
    }
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => {
          const count =
            tab === "All"
              ? requests.length
              : requests.filter((r) => r.status === tab.toUpperCase()).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No {activeTab.toLowerCase()} requests
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
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
                    <span className="font-medium text-gray-700">{request.student.name}</span>
                    {" "}&middot; {request.student.email}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: request.course.color }}
                    />
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  {request.status === "PENDING" && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === request.id ? null : request.id)
                      }
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {expandedId === request.id ? "Close" : "Respond"}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded respond panel */}
              {expandedId === request.id && request.status === "PENDING" && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {/* Approve form */}
                  <form action={handleApprove} className="bg-green-50 rounded-lg p-4">
                    <input type="hidden" name="requestId" value={request.id} />
                    <h4 className="font-medium text-green-800 mb-3">Approve & Schedule</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm text-green-700 mb-1">
                          Schedule Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          name="scheduledAt"
                          required
                          defaultValue={getDefaultScheduledAt(request)}
                          className="w-full rounded-lg border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-green-700 mb-1">
                          Meet Link <span className="text-green-400">(optional)</span>
                        </label>
                        <input
                          type="url"
                          name="meetLink"
                          placeholder="https://meet.google.com/..."
                          className="w-full rounded-lg border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loadingId === request.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loadingId === request.id ? "Scheduling..." : "Approve & Schedule"}
                    </button>
                  </form>

                  {/* Reject form */}
                  <form action={handleReject} className="bg-red-50 rounded-lg p-4">
                    <input type="hidden" name="requestId" value={request.id} />
                    <h4 className="font-medium text-red-800 mb-3">Reject</h4>
                    <div className="mb-3">
                      <label className="block text-sm text-red-700 mb-1">
                        Reason <span className="text-red-400">(optional)</span>
                      </label>
                      <textarea
                        name="rejectionReason"
                        rows={2}
                        placeholder="Explain why this request is being rejected..."
                        className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingId === request.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loadingId === request.id ? "Rejecting..." : "Reject"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
