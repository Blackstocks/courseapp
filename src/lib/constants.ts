export const COURSES = [
  {
    title: "Frontend Development",
    description: "Modern frontend with React, Next.js, and TypeScript",
    slug: "frontend",
    color: "#3B82F6", // blue
  },
  {
    title: "Backend Development",
    description: "Server-side development with Node.js, APIs, and databases",
    slug: "backend",
    color: "#10B981", // green
  },
  {
    title: "AI Agent Development",
    description: "Building intelligent AI agents and LLM applications",
    slug: "ai-agent",
    color: "#8B5CF6", // purple
  },
  {
    title: "Deployment & DevOps",
    description: "CI/CD, Docker, cloud deployment, and infrastructure",
    slug: "deployment",
    color: "#F59E0B", // amber
  },
] as const;

export const LESSON_STATUSES = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const RESOURCE_TYPES = {
  PDF: "PDF",
  LINK: "LINK",
  VIDEO: "VIDEO",
  NOTES: "NOTES",
} as const;

export const NOTIFICATION_TYPES = {
  LESSON_SCHEDULED: "LESSON_SCHEDULED",
  RESOURCE_ADDED: "RESOURCE_ADDED",
  LESSON_UPDATED: "LESSON_UPDATED",
} as const;
