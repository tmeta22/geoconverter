import type {Metadata} from 'next';
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
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
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
