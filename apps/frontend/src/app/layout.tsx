import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/trpc/provider";
import AuthProvider from "@/components/providers/session-provider";

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
        <AuthProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}