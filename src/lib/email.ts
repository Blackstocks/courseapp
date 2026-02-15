import nodemailer from "nodemailer";

const emailConfigured =
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  !process.env.EMAIL_SERVER_USER.includes("your-");

const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    console.warn(
      "[Email] Skipping email - SMTP not configured. Update EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD in .env"
    );
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "CourseApp <noreply@courseapp.com>",
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
  }
}

export async function sendLessonNotificationEmail({
  to,
  studentName,
  lessonTitle,
  courseName,
  scheduledAt,
  meetLink,
}: {
  to: string;
  studentName: string;
  lessonTitle: string;
  courseName: string;
  scheduledAt: string;
  meetLink: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Class Scheduled</h2>
      <p>Hi ${studentName},</p>
      <p>A new class has been scheduled:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Course:</strong> ${courseName}</p>
        <p><strong>Lesson:</strong> ${lessonTitle}</p>
        <p><strong>Time:</strong> ${scheduledAt}</p>
        ${meetLink ? `<p><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ""}
      </div>
      <p>See you in class!</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `New Class: ${lessonTitle} - ${courseName}`,
    html,
  });
}

export async function sendLessonUpdateEmail({
  to,
  studentName,
  lessonTitle,
  courseName,
  recordingLink,
  status,
}: {
  to: string;
  studentName: string;
  lessonTitle: string;
  courseName: string;
  recordingLink?: string;
  status?: string;
}) {
  const updateDetail = recordingLink
    ? `<p><strong>Recording:</strong> <a href="${recordingLink}">Watch Recording</a></p>`
    : `<p><strong>Status:</strong> ${status}</p>`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Lesson Updated</h2>
      <p>Hi ${studentName},</p>
      <p>A lesson has been updated:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Course:</strong> ${courseName}</p>
        <p><strong>Lesson:</strong> ${lessonTitle}</p>
        ${updateDetail}
      </div>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Lesson Updated: ${lessonTitle} - ${courseName}`,
    html,
  });
}

export async function sendResourceNotificationEmail({
  to,
  studentName,
  resourceTitle,
  courseName,
  resourceType,
}: {
  to: string;
  studentName: string;
  resourceTitle: string;
  courseName: string;
  resourceType: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Resource Added</h2>
      <p>Hi ${studentName},</p>
      <p>A new resource has been added to your course:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Course:</strong> ${courseName}</p>
        <p><strong>Resource:</strong> ${resourceTitle}</p>
        <p><strong>Type:</strong> ${resourceType}</p>
      </div>
      <p>Check it out in the app!</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `New Resource: ${resourceTitle} - ${courseName}`,
    html,
  });
}
