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
  title: "Good News Paper - 따뜻하고 희망찬 뉴스만 모아서",
  description: "감동적이고 긍정적인 뉴스만을 엄선하여 전해드리는 Good News Paper. 따뜻한 마음과 희망을 전하는 특별한 뉴스 경험을 만나보세요.",
  keywords: ["좋은뉴스", "감동뉴스", "희망뉴스", "긍정뉴스", "따뜻한뉴스", "Good News", "감동적인뉴스", "희망적인뉴스"],
  authors: [{ name: "Good News Paper Team" }],
  creator: "Good News Paper",
  publisher: "Good News Paper",
  applicationName: "Good News Paper",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://goodnews-paper.vercel.app",
    siteName: "Good News Paper",
    title: "Good News Paper - 따뜻하고 희망찬 뉴스만 모아서",
    description: "감동적이고 긍정적인 뉴스만을 엄선하여 전해드리는 Good News Paper. 따뜻한 마음과 희망을 전하는 특별한 뉴스 경험을 만나보세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Good News Paper - 따뜻하고 희망찬 뉴스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Good News Paper - 따뜻하고 희망찬 뉴스만 모아서",
    description: "감동적이고 긍정적인 뉴스만을 엄선하여 전해드리는 Good News Paper",
    images: ["/og-image.png"],
    creator: "@goodnewspaper",
  },
  metadataBase: new URL('https://goodnews-paper.vercel.app'),
  verification: {
    google: "google-site-verification-code", // Google Search Console에서 발급받은 코드
    // yandex: "yandex-verification-code",
    // yahoo: "yahoo-verification-code",
  },
  category: "news",
  classification: "News and Media",
  other: {
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Favicon과 아이콘들 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* 브라우저 테마 색상 */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* 캐노니컬 URL */}
        <link rel="canonical" href="https://goodnews-paper.vercel.app" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 보안 헤더들 */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* RSS 피드 */}
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="Good News Paper RSS Feed" 
          href="/api/rss" 
        />
        
        {/* 구글 사이트 인증 (실제 코드로 교체 필요) */}
        {/* <meta name="google-site-verification" content="your-google-verification-code" /> */}
        
        {/* 네이버 사이트 인증 (실제 코드로 교체 필요) */}
        {/* <meta name="naver-site-verification" content="your-naver-verification-code" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Google Analytics (실제 ID로 교체 필요) */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `
        }} /> */}
      </body>
    </html>
  );
}
