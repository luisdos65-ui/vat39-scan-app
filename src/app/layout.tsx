import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vat39 De Specialist",
  description: "Scan & Discover wines and spirits",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vat39",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAFAFA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface2 text-text`}
      >
        <Script 
          src="https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js" 
          strategy="lazyOnload"
        />
        <div className="mx-auto max-w-md min-h-[100dvh] bg-bg relative shadow-2xl shadow-black/5 flex flex-col">
            <main className="flex-1 pb-24 px-4 pt-4">
                {children}
            </main>
            <BottomNav />
        </div>
      </body>
    </html>
  );
}
