import type { Metadata } from 'next';
import { Noto_Sans_KR, Noto_Serif_KR, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

// Primary Font: 한글 가독성이 우수한 Noto Sans KR
const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

// Secondary Font: 전통적 느낌의 명조체 (사주 해석 등에 활용)
const notoSerifKR = Noto_Serif_KR({
  variable: '--font-noto-serif-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// Monospace Font: 코드나 숫자 표시용
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '사주나우 - 현대적 감성의 사주 풀이',
  description: '전통 사주를 현대적이고 감성적인 UI로 쉽고 재미있게 체험하며, SNS로 공유할 수 있는 웹 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} ${notoSerifKR.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
