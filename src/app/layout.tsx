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

const SITE_URL = "https://fallowkind.com";
const SITE_DESCRIPTION =
  "Fallowkind makes slow-fashion clothing from 100% natural fibres — cotton, linen, hemp. No polyester, no microplastics. Kind to your skin, kinder to the earth.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Fallowkind — Natural Fibre, Slow Fashion Clothing", template: "%s | Fallowkind" },
  description: SITE_DESCRIPTION,
  keywords: [
    "Fallowkind",
    "natural fibre clothing",
    "slow fashion",
    "sustainable clothing",
    "organic cotton",
    "linen clothing",
    "plastic-free clothing",
    "ethical fashion",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Fallowkind",
    title: "Fallowkind — Natural Fibre, Slow Fashion Clothing",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/logo with background.png", width: 1200, height: 630, alt: "Fallowkind" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fallowkind — Natural Fibre, Slow Fashion Clothing",
    description: SITE_DESCRIPTION,
    images: ["/logo with background.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico" },
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
