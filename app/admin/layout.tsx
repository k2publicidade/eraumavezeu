import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin — Era Uma Vez Eu",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware já bloqueia /admin para não-admins; defesa em profundidade
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
