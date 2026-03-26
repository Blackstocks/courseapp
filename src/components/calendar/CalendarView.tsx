"use client";

import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { EventMountArg } from "@fullcalendar/core";

function formatTime(date: Date, timezone: string) {
  try {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  SCHEDULED: { label: "Scheduled", cls: "cal-status-scheduled" },
  COMPLETED: { label: "Completed", cls: "cal-status-completed" },
  CANCELLED: { label: "Cancelled", cls: "cal-status-cancelled" },
};

export default function CalendarView({ timezone }: { timezone: string }) {
  const tooltipEl = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create the tooltip DOM element once on mount, outside React rendering
  useEffect(() => {
    const el = document.createElement("div");
    el.className = "cal-tooltip";
    el.style.display = "none";
    document.body.appendChild(el);
    tooltipEl.current = el;

    // Keep tooltip open when hovering over it
    el.addEventListener("mouseenter", () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    });
    el.addEventListener("mouseleave", () => {
      el.style.display = "none";
    });

    return () => {
      document.body.removeChild(el);
      tooltipEl.current = null;
    };
  }, []);

  function showTooltip(anchorEl: HTMLElement, event: EventMountArg["event"]) {
    const tip = tooltipEl.current;
    if (!tip) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);

    const props = event.extendedProps;
    const status = STATUS_MAP[props.status] || STATUS_MAP.SCHEDULED;
    const time = event.start ? formatTime(event.start, timezone) : "";
    const color = event.backgroundColor || "#3b82f6";

    // Build tooltip HTML directly — no React, no state, no re-renders
    let html = `<div class="cal-tip-bar" style="background:${color}"></div>`;
    html += `<div class="cal-tip-body">`;
    html += `<div class="cal-tip-course">${escHtml(props.courseTitle)}</div>`;
    html += `<div class="cal-tip-lesson">${escHtml(props.lessonTitle)}</div>`;
    if (props.description) {
      html += `<div class="cal-tip-desc">${escHtml(props.description)}</div>`;
    }
    html += `<div class="cal-tip-meta">`;
    html += `<span class="cal-tip-time">${time}</span>`;
    html += `<span class="cal-tip-status ${status.cls}">${status.label}</span>`;
    html += `</div>`;

    if (props.meetLink && props.status === "SCHEDULED") {
      html += `<div class="cal-tip-actions"><a href="${escAttr(props.meetLink)}" target="_blank" rel="noopener noreferrer" class="cal-tip-link cal-tip-link-meet">Join Meet</a></div>`;
    }
    if (props.recordingLink && props.status === "COMPLETED") {
      html += `<div class="cal-tip-actions"><a href="${escAttr(props.recordingLink)}" target="_blank" rel="noopener noreferrer" class="cal-tip-link cal-tip-link-rec">Recording</a></div>`;
    }

    html += `</div>`;

    tip.innerHTML = html;
    tip.style.display = "block";

    // Position using viewport coords
    const rect = anchorEl.getBoundingClientRect();
    const tipWidth = 280;
    let left = rect.left + rect.width / 2 - tipWidth / 2;
    let top = rect.top - 8;

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + tipWidth > window.innerWidth - 8) left = window.innerWidth - tipWidth - 8;

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.style.transform = "translateY(-100%)";
  }

  function hideTooltipDelayed() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (tooltipEl.current) tooltipEl.current.style.display = "none";
    }, 200);
  }

  function handleEventMount(info: EventMountArg) {
    const el = info.el;

    const onEnter = () => showTooltip(el, info.event);
    const onLeave = () => hideTooltipDelayed();

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    (el as HTMLElement & { _ttCleanup?: () => void })._ttCleanup = () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }

  function handleEventUnmount(info: EventMountArg) {
    const cleanup = (info.el as HTMLElement & { _ttCleanup?: () => void })
      ._ttCleanup;
    if (cleanup) cleanup();
  }

  return (
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
        events={{ url: "/api/lessons", method: "GET" }}
        eventDidMount={handleEventMount}
        eventWillUnmount={handleEventUnmount}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          if (info.event.url) window.location.href = info.event.url;
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
  );
}

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
