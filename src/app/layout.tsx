import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a", // Configura el color de la cabecera en dispositivos móviles y tarjetas de MS Teams
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://clinicapremed.grupoprecon.com"),
  title: {
    template: "%s | PREMED",
    default: "PREMED | Gestión Clínica Médica",
  },
  description: "Sistema de gestión clínica médica para control de pacientes y expedientes electrónicos.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'PREMED | Gestión Clínica Médica',
    description: 'Sistema de gestión clínica médica y control de expedientes.',
    siteName: 'PREMED',
    images: [
      {
        url: '/premed-dark.png',
        width: 1200,
        height: 630,
        alt: 'PREMED - Gestión Clínica',
      },
    ],
    locale: 'es_GT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PREMED | Gestión Clínica Médica',
    description: 'Sistema de gestión clínica médica y control de expedientes.',
    images: ['/premed-dark.png'],
  },
  icons: {
    icon: '/premed-dark-logo.svg',
    shortcut: '/premed-dark-logo.svg',
    apple: '/premed-dark-logo.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
