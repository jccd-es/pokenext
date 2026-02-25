import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokeNext",
  description:
    "A modern Pokémon explorer built with Next.js and TypeScript, consuming the PokéAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} min-h-screen bg-zinc-50 antialiased dark:bg-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}
