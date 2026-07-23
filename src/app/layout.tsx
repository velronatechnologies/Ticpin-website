import type { Metadata } from "next";
import { Anek_Latin, Anek_Tamil, Inter, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Rewrite relative /backend api calls to point directly to Cloudflare backend container
if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  const originalFetch = globalThis.fetch;
  if (originalFetch) {
    globalThis.fetch = function (input, init) {
      const targetBackend = "https://ticpin-backend.politebay-860bc91e.centralindia.azurecontainerapps.io";
      const shouldProxyBackend =
        (typeof input === "string" && input.startsWith("/backend/")) ||
        (input instanceof URL && input.pathname.startsWith("/backend/"));

      if (shouldProxyBackend) {
        if (typeof input === "string") {
          input = input.replace("/backend", targetBackend);
        } else if (input instanceof URL) {
          const newUrl = new URL(input.toString());
          newUrl.protocol = "https:";
          newUrl.host = "ticpin-backend.politebay-860bc91e.centralindia.azurecontainerapps.io";
          newUrl.pathname = newUrl.pathname.replace("/backend", "");
          input = newUrl;
        }

        init = init || {};
        init.headers = new Headers(init.headers);
        init.headers.set("X-Ticpin-Internal", "ticpin-ssr-secret");
        if (!init.signal) {
          init.signal = AbortSignal.timeout(8000);
        }
      }

      return originalFetch(input, init);
    };
  }
}


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
