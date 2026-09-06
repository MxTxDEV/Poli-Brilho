import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const SITE_URL = "https://polibrilho.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sabão Polibrilho | Brilho e Proteção",
  description:
    "Sabão Polibrilho para cuidado, brilho e acabamento automotivo.",
  keywords: [
    "Polibrilho",
    "sabão automotivo",
    "polimento de carro",
    "brilho automotivo",
    "limpeza de roda",
    "cera automotiva",
  ],
  authors: [{ name: "Polibrilho" }],
  openGraph: {
    title: "Sabão Polibrilho | Brilho e Proteção",
    description:
      "Sabão Polibrilho para cuidado, brilho e acabamento automotivo.",
    url: SITE_URL,
    siteName: "Polibrilho",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabão Polibrilho | Brilho e Proteção",
    description:
      "Sabão Polibrilho para cuidado, brilho e acabamento automotivo.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-bg font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
