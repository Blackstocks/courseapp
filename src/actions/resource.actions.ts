"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendResourceNotificationEmail } from "@/lib/email";

export async function addResource(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return { error: "Unauthorized" };
  }

  const courseId = formData.get("courseId") as string;
  const lessonId = formData.get("lessonId") as string | null;
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const url = formData.get("url") as string;

  if (!courseId || !title || !type || !url) {
    return { error: "All fields are required" };
  }

  const resource = await prisma.resource.create({
    data: {
      courseId,
      lessonId: lessonId || null,
      title,
      type,
      url,
    },
    include: { course: true },
  });

  // Fan out notifications
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { user: true },
  });

  const notifications = enrollments.map((enrollment) => ({
    userId: enrollment.userId,
    message: `New resource: ${title} - ${resource.course.title}`,
    type: "RESOURCE_ADDED",
    link: `/courses/${resource.course.slug}`,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  // Send emails (fire-and-forget)
  for (const enrollment of enrollments) {
    sendResourceNotificationEmail({
      to: enrollment.user.email,
      studentName: enrollment.user.name,
      resourceTitle: title,
      courseName: resource.course.title,
      resourceType: type,
    }).catch(console.error);
  }

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin/resources");
  return { success: true };
}
