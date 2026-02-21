import type { Metadata } from "next";
import { Anek_Latin, Anek_Tamil, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
// import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

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

export const metadata: Metadata = {
  title: "TICPIN",
  description: "Your gateway to world-class sports and entertainment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anekLatin.variable} ${inter.variable} ${anekTamil.variable} font-sans antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-80px)]">
              {children}
            </main>
            {/* <Footer /> */}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
