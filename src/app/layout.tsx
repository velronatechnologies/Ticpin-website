import type { Metadata } from "next";
import Script from "next/script";
import { Anek_Latin, Anek_Tamil, Inter, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import NavbarWrapper from "@/components/layout/NavbarWrapper";
import Providers from "@/components/providers/Providers";
import { ToastProvider } from "@/components/ui/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import React, { Suspense } from "react";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const anekLatin = Anek_Latin({
  subsets: ["latin"],
  variable: "--font-anek-latin",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const anekTamil = Anek_Tamil({
  subsets: ["tamil", "latin"],
  variable: "--font-anek-tamil",
  weight: ["400", "500", "600", "700", "800"],
});

const anekTamilCondensed = localFont({
  src: [
    {
      path: './fonts/AnekTamil_Condensed-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/AnekTamil_Condensed-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-anek-tamil-condensed",
});

export const metadata: Metadata = {
  title: "Ticpin | Explore Dining, Events, & Play Venues",
  description: "Your ultimate gateway to world-class sports, entertainment, and dining. Book events, find sports venues, and discover the best dining experiences on Ticpin.",
  keywords: ["Ticpin", "Dining", "Events", "Sports", "Booking", "Entertainment"],
  authors: [{ name: "Ticpin Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.jpg', type: 'image/jpeg' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.jpg'
  },
  openGraph: {
    title: "Ticpin | Explore Dining, Events, & Play Venues",
    description: "Your ultimate gateway to world-class sports, entertainment, and dining.",
    url: "https://ticpin.com",
    siteName: "Ticpin",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans overflow-x-hidden w-full", geist.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2879369472419177');
fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2879369472419177&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={`${anekLatin.variable} ${inter.variable} ${anekTamil.variable} ${anekTamilCondensed.variable} font-sans antialiased text-black overflow-x-hidden w-full`}>
        <ToastProvider>
          <Providers>
            <ErrorBoundary>
              <Suspense fallback={null}>
                <NavbarWrapper />
              </Suspense>
              {children}
            </ErrorBoundary>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
