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
  weight: ['200', '300', '400', '500', '600', '700', '900'],
  display: 'swap',
});

// Monospace Font: 코드나 숫자 표시용
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '개-사주 - AI가 풀어주는 나만의 사주 해석',
    template: '%s | 개-사주'
  },
  description: '전통 사주를 AI가 개인화하여 현대적이고 감성적으로 해석해주는 무료 사주 서비스. 생년월일과 시간만으로 나만의 운명을 알아보세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.variable} ${notoSerifKR.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}