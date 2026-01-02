import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google"; // <--- Cinzel importiert
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ["latin"], variable: '--font-cinzel' }); // <--- Variable definiert

export const metadata: Metadata = {
  title: "GaiaForge",
  description: "AI Powered Hytale Modding Tutor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Beide Fonts hier laden */}
      <body className={`${inter.className} ${cinzel.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}