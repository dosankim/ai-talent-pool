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
  title: "AI 시니어 캐스팅 | 중장년 AI 전화 인터뷰",
  description: "AI가 당신의 경력과 역량을 분석해 최적의 역할 자산으로 전환해드립니다. 중장년층을 위한 맞춤형 인재풀 서비스입니다.",
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
