"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const calendarRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredEl = useRef<HTMLElement | null>(null);

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
      hoveredEl.current = null;
    }, 200);
  }, [clearHideTimeout]);

  // Attach mouseenter/leave on tooltip element to keep it open
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

  const handleEventMount = useCallback(
    (info: EventMountArg) => {
      const el = info.el;
      const event = info.event;

      const onEnter = () => {
        clearHideTimeout();
        hoveredEl.current = el;

        const rect = el.getBoundingClientRect();
        const containerRect = calendarRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top;

        setTooltipPos({ x, y });
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

      // Store cleanup references on the element
      (el as HTMLElement & { _calCleanup?: () => void })._calCleanup = () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    [timezone, clearHideTimeout, scheduleHide]
  );

  const handleEventUnmount = useCallback((info: EventMountArg) => {
    const cleanup = (
      info.el as HTMLElement & { _calCleanup?: () => void }
    )._calCleanup;
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

  const status = tooltip
    ? statusConfig[tooltip.status] || statusConfig.SCHEDULED
    : null;
  const StatusIcon = status?.icon || Clock;

  return (
    <div ref={calendarRef} className="relative">
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

      {/* Tooltip */}
      {tooltip && status && (
        <div
          ref={tooltipRef}
          className="absolute z-50"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%) translateY(-8px)",
          }}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-72 overflow-hidden animate-tooltip-in">
            {/* Color bar */}
            <div
              className="h-1.5"
              style={{ backgroundColor: tooltip.color }}
            />

            <div className="p-4 space-y-3">
              {/* Course title */}
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

              {/* Lesson title */}
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

              {/* Time & Status row */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Clock size={13} className="text-gray-400" />
                  {tooltip.time}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              {/* Action links */}
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
                  {tooltip.recordingLink && tooltip.status === "COMPLETED" && (
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

            {/* Click hint */}
            <div className="bg-gray-50 px-4 py-2 text-center">
              <p className="text-[11px] text-gray-400">
                Click to view course details
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
