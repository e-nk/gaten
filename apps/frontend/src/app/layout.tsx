import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/trpc/provider";


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
				<TRPCProvider>
          {children}
				</TRPCProvider>
      </body>
    </html>
  );
}