import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { MarketToggle } from "@/components/admin/market-toggle";
import { getAdminMarket } from "@/lib/admin/market";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const market = await getAdminMarket();

  return (
    <div className="flex min-h-0 flex-1">
      <AdminSidebar />
      <main className="min-w-0 flex-1 pt-14 lg:pt-0 p-2 sm:p-3 lg:p-4 overflow-y-auto">
        <div className="mb-4 flex items-center justify-end">
          <MarketToggle initial={market} />
        </div>
        {children}
      </main>
    </div>
  );
}
