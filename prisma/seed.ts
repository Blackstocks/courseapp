import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COURSES = [
  {
    title: "Frontend Development",
    description: "Modern frontend with React, Next.js, and TypeScript",
    slug: "frontend",
    color: "#3B82F6",
  },
  {
    title: "Backend Development",
    description: "Server-side development with Node.js, APIs, and databases",
    slug: "backend",
    color: "#10B981",
  },
  {
    title: "AI Agent Development",
    description: "Building intelligent AI agents and LLM applications",
    slug: "ai-agent",
    color: "#8B5CF6",
  },
  {
    title: "Deployment & DevOps",
    description: "CI/CD, Docker, cloud deployment, and infrastructure",
    slug: "deployment",
    color: "#F59E0B",
  },
];

async function main() {
  console.log("Seeding database...");

  // Create instructor
  const hashedPassword = await bcrypt.hash("instructor123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@courseapp.com" },
    update: {},
    create: {
      name: "Instructor",
      email: "instructor@courseapp.com",
      password: hashedPassword,
      role: "INSTRUCTOR",
      timezone: "Asia/Kolkata",
    },
  });
  console.log("Created instructor:", instructor.email);

  // Create courses
  for (const course of COURSES) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: course,
    });
    console.log("Created course:", course.title);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
