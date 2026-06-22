import type { Metadata } from "next";
import { Anek_Latin, Anek_Tamil, Inter, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Rewrite relative /backend api calls to point directly to Cloudflare backend container
if (typeof globalThis !== "undefined") {
  const originalFetch = globalThis.fetch;
  if (originalFetch) {
    globalThis.fetch = function (input, init) {
      const targetBackend = "https://go-backend.ramjib2311.workers.dev";
      if (typeof input === "string" && input.startsWith("/backend/")) {
        input = input.replace("/backend", targetBackend);
      } else if (input instanceof URL && input.pathname.startsWith("/backend/")) {
        const newUrl = new URL(input.toString());
        newUrl.protocol = "https:";
        newUrl.host = "go-backend.ramjib2311.workers.dev";
        newUrl.pathname = newUrl.pathname.replace("/backend", "");
        input = newUrl;
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
              <NavbarWrapper />
              {children}
            </ErrorBoundary>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
