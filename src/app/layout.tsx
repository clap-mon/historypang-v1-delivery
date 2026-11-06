import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "역사팡: 선사시대와 고조선",
  description: "초등 5학년 2학기 사회 교과 연계 역사 탐구 시간여행 - 구석기, 신석기, 청동기, 고조선 건국과 8조법",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
