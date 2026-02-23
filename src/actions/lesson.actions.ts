"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendLessonNotificationEmail, sendLessonUpdateEmail, sendLessonRescheduleEmail } from "@/lib/email";
import { formatInTimeZone } from "date-fns-tz";

export async function scheduleLesson(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return { error: "Unauthorized" };
  }

  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const meetLink = formData.get("meetLink") as string;

  if (!courseId || !title || !scheduledAt) {
    return { error: "Course, title, and date/time are required" };
  }

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title,
      description: description || "",
      scheduledAt: new Date(scheduledAt),
      meetLink: meetLink || "",
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
    message: `New class scheduled: ${title} - ${lesson.course.title}`,
    type: "LESSON_SCHEDULED",
    link: `/courses/${lesson.course.slug}`,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  // Send emails (fire-and-forget)
  for (const enrollment of enrollments) {
    const userTz = enrollment.user.timezone || "UTC";
    sendLessonNotificationEmail({
      to: enrollment.user.email,
      studentName: enrollment.user.name,
      lessonTitle: title,
      courseName: lesson.course.title,
      scheduledAt: formatInTimeZone(
        lesson.scheduledAt,
        userTz,
        "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
      ),
      meetLink: meetLink || "",
    }).catch(console.error);
  }

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin/lessons");
  return { success: true };
}

export async function updateLesson(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return { error: "Unauthorized" };
  }

  const lessonId = formData.get("lessonId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const meetLink = formData.get("meetLink") as string;
  const recordingLink = formData.get("recordingLink") as string;
  const status = formData.get("status") as string;

  if (!lessonId) {
    return { error: "Lesson ID is required" };
  }

  // Fetch old lesson to detect changes
  const oldLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!oldLesson) {
    return { error: "Lesson not found" };
  }

  const data: Record<string, string | Date> = {};
  if (title) data.title = title;
  if (description !== null && description !== undefined) data.description = description;
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
  if (meetLink !== null && meetLink !== undefined) data.meetLink = meetLink;
  if (recordingLink !== null && recordingLink !== undefined) data.recordingLink = recordingLink;
  if (status) data.status = status;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data,
    include: { course: true },
  });

  // Detect schedule-related changes
  const scheduleChanged =
    (title && title !== oldLesson.title) ||
    (scheduledAt && new Date(scheduledAt).getTime() !== oldLesson.scheduledAt.getTime()) ||
    (meetLink !== null && meetLink !== undefined && meetLink !== oldLesson.meetLink);

  const recordingAdded = recordingLink && recordingLink !== oldLesson.recordingLink;

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: lesson.courseId },
    include: { user: true },
  });

  // Send reschedule notifications if schedule details changed
  if (scheduleChanged && enrollments.length > 0) {
    const notifications = enrollments.map((enrollment) => ({
      userId: enrollment.userId,
      message: `Class rescheduled: ${lesson.title} - ${lesson.course.title}`,
      type: "LESSON_UPDATED",
      link: `/courses/${lesson.course.slug}`,
    }));

    await prisma.notification.createMany({ data: notifications });

    for (const enrollment of enrollments) {
      const userTz = enrollment.user.timezone || "UTC";
      sendLessonRescheduleEmail({
        to: enrollment.user.email,
        studentName: enrollment.user.name,
        lessonTitle: lesson.title,
        courseName: lesson.course.title,
        scheduledAt: formatInTimeZone(
          lesson.scheduledAt,
          userTz,
          "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
        ),
        meetLink: lesson.meetLink || "",
      }).catch(console.error);
    }
  }
  // Send recording/status update notifications (only if no reschedule email already sent)
  else if ((recordingAdded || status === "COMPLETED") && enrollments.length > 0) {
    const message = recordingAdded
      ? `Recording added for: ${lesson.title} - ${lesson.course.title}`
      : `Lesson updated: ${lesson.title} - ${lesson.course.title}`;

    const notifications = enrollments.map((enrollment) => ({
      userId: enrollment.userId,
      message,
      type: "LESSON_UPDATED",
      link: `/courses/${lesson.course.slug}`,
    }));

    await prisma.notification.createMany({ data: notifications });

    for (const enrollment of enrollments) {
      sendLessonUpdateEmail({
        to: enrollment.user.email,
        studentName: enrollment.user.name,
        lessonTitle: lesson.title,
        courseName: lesson.course.title,
        recordingLink: recordingAdded ? recordingLink : undefined,
        status: status || undefined,
      }).catch(console.error);
    }
  }

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin/lessons");
  return { success: true };
}
