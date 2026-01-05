import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "agree - 契約書リスク解析AI",
  description: "契約書のリスクを静かにチェックするシンプルなAIツール。フリーランス・個人事業主のための無料契約書チェッカー。",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "agree - 契約書リスク解析AI",
    description: "契約書のリスクを静かにチェックするシンプルなAIツール。フリーランス・個人事業主のための無料契約書チェッカー。",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "agree logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "agree - 契約書リスク解析AI",
    description: "契約書のリスクを静かにチェックするシンプルなAIツール",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

