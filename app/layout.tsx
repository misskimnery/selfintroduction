import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "김태연 — 사회의 구석진 곳을 들여다봅니다",
  description:
    "정치와 사회, 그리고 동물. 당연한 것을 의심하고 조금씩 바꿔보려는 김태연의 포트폴리오입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&family=Instrument+Serif:ital@0;1&family=Nanum+Myeongjo:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
