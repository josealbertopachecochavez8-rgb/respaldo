import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IncidenciasProvider } from "../context/IncidenciasContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Incidencias",
  description: "Panel de control",
};

// ESTO ES LO QUE TE FALTA EN TU ARCHIVO:
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <IncidenciasProvider>
          {children}
        </IncidenciasProvider>
      </body>
    </html>
  );
}