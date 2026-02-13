import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SiteLayout } from "@/components/layout";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "VECTRA INTERNATIONAL | LMS Dashboard",
  description: "Enabling Positive Impact - Training & Learning Management",
  icons: {
    icon: "https://marketplace.vectra-intl.com/cdn/shop/files/FAVICO-01.png?crop=center&height=32&v=1768200030&width=32",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
