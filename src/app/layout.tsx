import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminLink } from "@/components/AdminLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "실버 캐스팅 | 중장년 AI 전화 인터뷰",
  description: "AI와의 전화를 통해 완성되는 당신만의 빛나는 이력서. 중장년층을 위한 맞춤형 인재풀 서비스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <AdminLink />
      </body>
    </html>
  );
}
