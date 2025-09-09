import type {Metadata, Viewport} from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#003893'
};
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ClientOnly } from '@/components/client-only';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { FontLoader } from '@/components/font-loader';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Geo-Converter',
  description: 'Convert various geospatial and data file formats.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Geo-Converter'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#003893" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Geo-Converter" />
        <meta name="msapplication-TileColor" content="#003893" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" sizes="152x152" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#003893" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@100;200;300;400;500;600;700;800;900&family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;500;600;700&display=swap&subset=khmer,latin" rel="stylesheet" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600&display=swap&subset=khmer" as="style" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600&display=swap" as="style" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap" as="style" />
      </head>
      <body className="antialiased fonts-loading" suppressHydrationWarning>
        <FontLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                {children}
            </main>
            <ClientOnly>
              <Toaster />
            </ClientOnly>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
