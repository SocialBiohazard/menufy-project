import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Space_Grotesk,
  Playfair_Display,
  DM_Serif_Display,
  Sora,
  Geist,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Admin UI font.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// Menu theme font library. A theme picks its display/body font by referencing
// one of these CSS variables (see lib/themes.ts). Adding a font here is the
// only code touch needed to give a theme a new typeface.
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400", display: "swap" });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "MenuApp",
  description: "Digital QR menus for restaurants",
};

const fontVars = [
  geist.variable,
  fraunces.variable,
  inter.variable,
  spaceGrotesk.variable,
  playfair.variable,
  dmSerif.variable,
  sora.variable,
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased font-sans", ...fontVars)}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
