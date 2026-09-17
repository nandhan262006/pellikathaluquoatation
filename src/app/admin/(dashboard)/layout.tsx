import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-0 flex-1">
      <AdminSidebar />
      <main className="min-w-0 flex-1 pt-14 lg:pt-0 p-2 sm:p-3 lg:p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
