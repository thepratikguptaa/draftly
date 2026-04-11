import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Draftly - AI-Powered Microblogging",
  description: "Write smarter, post better. AI-powered microblogging platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
