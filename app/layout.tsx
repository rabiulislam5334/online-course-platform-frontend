import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip"; // Tooltip provider import
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skillora | Learning Platform", // Apnar project name onujayi change kora hoyeche
  description: "Next-generation course platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // Theme optimization-er jonno eta dewa bhalo
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
        </Providers>
        
      </body>
    </html>
  );
}