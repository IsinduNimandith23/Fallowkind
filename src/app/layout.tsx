import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Fallowkind", template: "%s | Fallowkind" },
  description: "Clothing rooted in the land. Regenerative living.",
  icons: {
    icon: "/circle sticker.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
