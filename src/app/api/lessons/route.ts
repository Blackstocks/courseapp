import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: Record<string, unknown> = {};
    if (start && end) {
      where.scheduledAt = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        course: { select: { title: true, color: true, slug: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const events = lessons.map((lesson) => ({
      id: lesson.id,
      title: `${lesson.course.title}: ${lesson.title}`,
      start: lesson.scheduledAt.toISOString(),
      end: new Date(
        lesson.scheduledAt.getTime() + 60 * 60 * 1000
      ).toISOString(),
      backgroundColor: lesson.course.color,
      borderColor: lesson.course.color,
      url: `/courses/${lesson.course.slug}`,
      extendedProps: {
        courseTitle: lesson.course.title,
        lessonTitle: lesson.title,
        status: lesson.status,
        meetLink: lesson.meetLink,
      },
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Lessons API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
