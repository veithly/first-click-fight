import type { Metadata } from "next";
import { Archivo_Black, Atkinson_Hyperlegible, IBM_Plex_Mono } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { NovusScript } from "@/components/NovusScript";

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});
const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

const description = "Score first clicks, ship a 30-second rematch.";

export const metadata: Metadata = {
  title: "First-Click Fight",
  description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4387"),
  openGraph: {
    title: "First-Click Fight",
    description,
    images: ["/brand/og.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <meta name="theme-color" content="#18202A" />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
        <NovusScript />
      </body>
    </html>
  );
}
