"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  sendExtraClassRequestEmail,
  sendExtraClassDecisionEmail,
  sendLessonNotificationEmail,
} from "@/lib/email";
import { formatInTimeZone } from "date-fns-tz";

export async function submitExtraClassRequest(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return { error: "Unauthorized" };
  }

  const courseId = formData.get("courseId") as string;
  const preferredDate = formData.get("preferredDate") as string;
  const availableFrom = formData.get("availableFrom") as string;
  const availableTo = formData.get("availableTo") as string;
  const topic = formData.get("topic") as string;
  const description = formData.get("description") as string;

  if (!courseId || !preferredDate || !availableFrom || !availableTo || !topic) {
    return { error: "Course, date, time range, and topic are required" };
  }

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });

  if (!enrollment) {
    return { error: "You are not enrolled in this course" };
  }

  const request = await prisma.extraClassRequest.create({
    data: {
      studentId: session.user.id,
      courseId,
      preferredDate: new Date(preferredDate),
      availableFrom,
      availableTo,
      topic,
      description: description || "",
    },
    include: { course: true, student: true },
  });

  // Notify instructor
  const instructor = await prisma.user.findFirst({
    where: { role: "INSTRUCTOR" },
  });

  if (instructor) {
    await prisma.notification.create({
      data: {
        userId: instructor.id,
        message: `Extra class requested by ${session.user.name}: ${topic} - ${request.course.title}`,
        type: "EXTRA_CLASS_REQUESTED",
        link: "/admin/extra-class-requests",
      },
    });

    sendExtraClassRequestEmail({
      to: instructor.email,
      studentName: session.user.name || "Student",
      courseName: request.course.title,
      topic,
      preferredDate,
      timeRange: `${availableFrom} - ${availableTo}`,
    }).catch(console.error);
  }

  revalidatePath("/extra-class");
  revalidatePath("/admin/extra-class-requests");
  return { success: true };
}

export async function approveExtraClassRequest(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return { error: "Unauthorized" };
  }

  const requestId = formData.get("requestId") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const meetLink = formData.get("meetLink") as string;

  if (!requestId || !scheduledAt) {
    return { error: "Request ID and scheduled time are required" };
  }

  const request = await prisma.extraClassRequest.findUnique({
    where: { id: requestId },
    include: { course: true, student: true },
  });

  if (!request || request.status !== "PENDING") {
    return { error: "Request not found or already processed" };
  }

  // Create lesson
  const lesson = await prisma.lesson.create({
    data: {
      courseId: request.courseId,
      title: `[Extra] ${request.topic}`,
      description: request.description,
      scheduledAt: new Date(scheduledAt),
      meetLink: meetLink || "",
    },
    include: { course: true },
  });

  // Update request
  await prisma.extraClassRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", lessonId: lesson.id },
  });

  // Notify the requesting student
  await prisma.notification.create({
    data: {
      userId: request.studentId,
      message: `Your extra class request "${request.topic}" has been approved!`,
      type: "EXTRA_CLASS_APPROVED",
      link: `/courses/${request.course.slug}`,
    },
  });

  const studentTz = request.student.timezone || "UTC";
  sendExtraClassDecisionEmail({
    to: request.student.email,
    studentName: request.student.name,
    courseName: request.course.title,
    topic: request.topic,
    approved: true,
    scheduledAt: formatInTimeZone(
      lesson.scheduledAt,
      studentTz,
      "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
    ),
    meetLink: meetLink || undefined,
  }).catch(console.error);

  // Fan out lesson notification to all enrolled students (same as scheduleLesson)
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: request.courseId },
    include: { user: true },
  });

  const notifications = enrollments.map((enrollment) => ({
    userId: enrollment.userId,
    message: `New class scheduled: ${lesson.title} - ${lesson.course.title}`,
    type: "LESSON_SCHEDULED",
    link: `/courses/${lesson.course.slug}`,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  for (const enrollment of enrollments) {
    const userTz = enrollment.user.timezone || "UTC";
    sendLessonNotificationEmail({
      to: enrollment.user.email,
      studentName: enrollment.user.name,
      lessonTitle: lesson.title,
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
  revalidatePath("/calendar");
  revalidatePath("/extra-class");
  revalidatePath("/admin/extra-class-requests");
  revalidatePath("/admin/lessons");
  return { success: true };
}

export async function rejectExtraClassRequest(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return { error: "Unauthorized" };
  }

  const requestId = formData.get("requestId") as string;
  const rejectionReason = formData.get("rejectionReason") as string;

  if (!requestId) {
    return { error: "Request ID is required" };
  }

  const request = await prisma.extraClassRequest.findUnique({
    where: { id: requestId },
    include: { course: true, student: true },
  });

  if (!request || request.status !== "PENDING") {
    return { error: "Request not found or already processed" };
  }

  await prisma.extraClassRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      rejectionReason: rejectionReason || "",
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: request.studentId,
      message: `Your extra class request "${request.topic}" has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
      type: "EXTRA_CLASS_REJECTED",
      link: "/extra-class",
    },
  });

  sendExtraClassDecisionEmail({
    to: request.student.email,
    studentName: request.student.name,
    courseName: request.course.title,
    topic: request.topic,
    approved: false,
    rejectionReason: rejectionReason || undefined,
  }).catch(console.error);

  revalidatePath("/extra-class");
  revalidatePath("/admin/extra-class-requests");
  return { success: true };
}
