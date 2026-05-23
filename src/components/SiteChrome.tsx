"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WelcomePopup from "./WelcomePopup";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-20">{children}</main>
      <Footer />
      <WelcomePopup />
    </>
  );
}
