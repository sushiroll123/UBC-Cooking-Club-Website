import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RootProviders from "@/components/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UBC Cooking Club",
  description: "Come join us!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RootProviders>
          <Navbar />
          {children}
          <Footer />
        </RootProviders>
      </body>
    </html>
  );
}
