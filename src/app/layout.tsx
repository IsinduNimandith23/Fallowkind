import type { Metadata } from "next";
import { Inter, Playfair_Display, Archivo_Black } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Fallowkind", template: "%s | Fallowkind" },
  description: "Kind to your skin, Kinder to the Earth",
  openGraph: {
    title: "Fallowkind",
    description: "Kind to your skin, Kinder to the Earth",
    images: ["/logo with background.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${archivoBlack.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
