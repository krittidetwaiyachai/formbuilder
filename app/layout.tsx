import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToasterWrapper from "@/components/ToasterWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Form Builder - Enterprise Form Builder",
  description: "Build beautiful forms with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToasterWrapper>
          <Navbar />
          {children}
        </ToasterWrapper>
      </body>
    </html>
  );
}

