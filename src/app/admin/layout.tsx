import type { Metadata } from "next";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  getAdminUserFromAccessToken,
  refreshAdminSession,
} from "@/lib/adminAuth";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;

  let user = await getAdminUserFromAccessToken(accessToken);
  if (!user) {
    const refreshed = await refreshAdminSession(refreshToken);
    user = refreshed?.user ?? null;
  }

  // Logged out: render the page bare (login screen handles its own layout)
  if (!user) {
    return <>{children}</>;
  }

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status", ["pending", "processing"]);

  return (
    <div className="fixed inset-0 z-[200] flex bg-gray-50" style={{ fontFamily: "var(--font-sans)" }}>
      <AdminSidebar pendingCount={count ?? 0} />
      <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
