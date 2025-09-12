import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaten",
  description: "e-learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-garamond antialiased">
          {children}
      </body>
    </html>
  );
}