import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geneo , Votre héritage familial prend vie",
  description: "Ne laissez pas vos racines s'effacer. Avec Geneo, documentez l'histoire de votre famille sur une plateforme moderne, sécurisée et facile à utiliser.",
  icons: {
    icon: '/favicon.png', // Optionnel si nommé favicon.ico dans /app
  },
  openGraph: {
    title: "Geneo",
    description: "Plateforme interactive de généalogie",
    url: "https://geneo.vercel.app",
    siteName: "Geneo",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
