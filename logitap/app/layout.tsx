import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import { GoogleMapsProvider } from "./contexts/GoogleMapsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logitap - Sistema de Gestión Logística",
  description: "Sistema completo de gestión logística para empresas de transporte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <GoogleMapsProvider>
            <Navbar />
            <main>{children}</main>
          </GoogleMapsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
