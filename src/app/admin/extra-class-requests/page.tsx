import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExtraClassRequestManager from "@/components/admin/ExtraClassRequestManager";
import PageHeader from "@/components/layout/PageHeader";

export default async function ExtraClassRequestsPage() {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") redirect("/");

  const requests = await prisma.extraClassRequest.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, color: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedRequests = requests.map((r) => ({
    ...r,
    preferredDate: r.preferredDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Extra Class Requests" />
      <ExtraClassRequestManager requests={serializedRequests} />
    </div>
  );
}
