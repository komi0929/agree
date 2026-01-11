import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "agree - 契約書確認サポート",
  description: "契約書の気になる点を確認してくれる、あなただけのマネージャー。フリーランス・個人事業主のための無料契約書サポート。",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "agree - 契約書確認サポート",
    description: "契約書の気になる点を確認してくれる、あなただけのマネージャー。フリーランス・個人事業主のための無料契約書サポート。",
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
    title: "agree - 契約書確認サポート",
    description: "契約書の気になる点を確認してくれる、あなただけのマネージャー",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


