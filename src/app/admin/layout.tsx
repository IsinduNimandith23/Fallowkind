import type { Metadata } from "next";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("fk_admin")?.value === process.env.ADMIN_TOKEN;

  // Logged out: render the page bare (login screen handles its own layout)
  if (!isAuthed) {
    return <>{children}</>;
  }

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status", ["pending", "processing"]);

  return (
    <div className="fixed inset-0 z-[200] flex bg-gray-50" style={{ fontFamily: "var(--font-sans)" }}>
      <AdminSidebar pendingCount={count ?? 0} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
