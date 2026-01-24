import type { Metadata } from "next";
import { Great_Vibes, Urbanist as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import Providers from "@/providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontGreatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Build your CV with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontGreatVibes.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
