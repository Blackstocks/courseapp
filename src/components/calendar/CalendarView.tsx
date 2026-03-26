"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { EventContentArg, EventMountArg } from "@fullcalendar/core";
import {
  Clock,
  CheckCircle,
  XCircle,
  Video,
  PlayCircle,
  BookOpen,
} from "lucide-react";

interface TooltipData {
  courseTitle: string;
  lessonTitle: string;
  description: string;
  status: string;
  meetLink: string;
  recordingLink: string;
  time: string;
  color: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    icon: Clock,
    className: "text-blue-600 bg-blue-50",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className: "text-green-600 bg-green-50",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "text-red-600 bg-red-50",
  },
};

function formatEventTime(dateStr: string, timezone: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  } catch {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

export default function CalendarView({ timezone }: { timezone: string }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Portal needs to wait for client mount
  useEffect(() => setMounted(true), []);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimeout();
    hideTimeout.current = setTimeout(() => {
      setTooltip(null);
    }, 250);
  }, [clearHideTimeout]);

  // Keep tooltip open when hovering over it
  useEffect(() => {
    const el = tooltipRef.current;
    if (!el || !tooltip) return;

    const onEnter = () => clearHideTimeout();
    const onLeave = () => scheduleHide();

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [tooltip, clearHideTimeout, scheduleHide]);

  // Use eventDidMount to attach hover to the stable .fc-event DOM element
  // This avoids React re-render issues with eventContent
  const handleEventMount = useCallback(
    (info: EventMountArg) => {
      const el = info.el;
      const event = info.event;

      const onEnter = () => {
        clearHideTimeout();

        // Use viewport coordinates (fixed positioning)
        const rect = el.getBoundingClientRect();

        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setTooltip({
          courseTitle: event.extendedProps.courseTitle,
          lessonTitle: event.extendedProps.lessonTitle,
          description: event.extendedProps.description,
          status: event.extendedProps.status,
          meetLink: event.extendedProps.meetLink,
          recordingLink: event.extendedProps.recordingLink,
          time: event.start
            ? formatEventTime(event.start.toISOString(), timezone)
            : "",
          color: event.backgroundColor || "#3b82f6",
        });
      };

      const onLeave = () => scheduleHide();

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);

      (el as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    [timezone, clearHideTimeout, scheduleHide]
  );

  const handleEventUnmount = useCallback((info: EventMountArg) => {
    const cleanup = (info.el as HTMLElement & { _cleanup?: () => void })
      ._cleanup;
    if (cleanup) cleanup();
  }, []);

  function renderEventContent(eventInfo: EventContentArg) {
    const { status } = eventInfo.event.extendedProps;
    const isMonth = eventInfo.view.type === "dayGridMonth";

    return (
      <div className="w-full px-1.5 py-0.5 cursor-pointer truncate">
        {isMonth ? (
          <div className="flex items-center gap-1 truncate">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  status === "CANCELLED"
                    ? "#ef4444"
                    : status === "COMPLETED"
                      ? "#22c55e"
                      : "currentColor",
              }}
            />
            <span className="text-xs font-medium truncate">
              {eventInfo.timeText}{" "}
              <span className="font-normal">
                {eventInfo.event.extendedProps.lessonTitle}
              </span>
            </span>
          </div>
        ) : (
          <div className="truncate">
            <div className="text-xs font-semibold truncate">
              {eventInfo.event.extendedProps.courseTitle}
            </div>
            <div className="text-xs truncate opacity-90">
              {eventInfo.event.extendedProps.lessonTitle}
            </div>
          </div>
        )}
      </div>
    );
  }

  const statusData = tooltip
    ? statusConfig[tooltip.status] || statusConfig.SCHEDULED
    : null;
  const StatusIcon = statusData?.icon || Clock;

  // Render tooltip via portal to document.body so it doesn't affect calendar layout
  const tooltipElement =
    mounted && tooltip && statusData
      ? createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] pointer-events-auto"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -100%) translateY(-8px)",
            }}
          >
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-72 overflow-hidden animate-tooltip-in">
              <div
                className="h-1.5"
                style={{ backgroundColor: tooltip.color }}
              />

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <BookOpen
                    size={16}
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Course
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {tooltip.courseTitle}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {tooltip.lessonTitle}
                  </p>
                  {tooltip.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {tooltip.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock size={13} className="text-gray-400" />
                    {tooltip.time}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusData.className}`}
                  >
                    <StatusIcon size={12} />
                    {statusData.label}
                  </span>
                </div>

                {(tooltip.meetLink || tooltip.recordingLink) && (
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    {tooltip.meetLink && tooltip.status === "SCHEDULED" && (
                      <a
                        href={tooltip.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Video size={13} />
                        Join Meet
                      </a>
                    )}
                    {tooltip.recordingLink &&
                      tooltip.status === "COMPLETED" && (
                        <a
                          href={tooltip.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PlayCircle size={13} />
                          Recording
                        </a>
                      )}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-2 text-center">
                <p className="text-[11px] text-gray-400">
                  Click to view course details
                </p>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 calendar-enhanced">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, momentTimezonePlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          timeZone={timezone}
          events={{
            url: "/api/lessons",
            method: "GET",
          }}
          eventContent={renderEventContent}
          eventDidMount={handleEventMount}
          eventWillUnmount={handleEventUnmount}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            if (info.event.url) {
              window.location.href = info.event.url;
            }
          }}
          height="auto"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          nowIndicator
          dayMaxEvents={3}
        />
      </div>
      {tooltipElement}
    </>
  );
}
