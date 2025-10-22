import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscriptionPromoBanner from "@/components/SubscriptionPromoBanner";
import TokenSync from "@/components/TokenSync";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "EV & Battery Marketplace",
  description: "Second-hand EV & Battery Listing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <TokenSync />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SubscriptionPromoBanner />
      </body>
    </html>
  );
}
