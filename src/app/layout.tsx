import type { Metadata } from "next";
import { Anek_Latin, Anek_Tamil, Inter, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";


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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script src="https://www.google.com/recaptcha/enterprise.js?render=6Ld05QEtAAAAAK20kaVHO-t9dagY3hG879PluY8c" async defer></script>
      </head>
      <body className={`${anekLatin.variable} ${inter.variable} ${anekTamil.variable} ${anekTamilCondensed.variable} font-sans antialiased text-black`}>
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
