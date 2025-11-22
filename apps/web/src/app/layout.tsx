import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import AppProviders from './providers'; // ✅ Client-side wagmi provider wrapper

const inter = Inter({ subsets: ['latin'] });

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

const frame = {
  version: "1",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Launch sisterSafe",
    action: {
      type: "launch_frame",
      name: "sisterSafe",
      url: appUrl,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: 'sisterSafe',
  description: 'A miniapp to share location safely',
  openGraph: {
    title: 'sisterSafe',
    description: 'A miniapp to share location safely',
    images: [`${appUrl}/opengraph-image.png`],
  },
  other: {
    'fc:frame': JSON.stringify(frame),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✅ Wagmi + QueryClient wrapped in a Client Component */}
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
