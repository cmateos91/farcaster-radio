import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farcaster Radio",
  description: "Live audio streaming on Farcaster",
  openGraph: {
    title: "Farcaster Radio",
    description: "Live audio streaming on Farcaster. Create your own radio station or tune in to others.",
    images: ["https://farcaster-radio.vercel.app/splash.png"],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://farcaster-radio.vercel.app/splash.png",
      button: {
        title: "Open Radio",
        action: {
          type: "launch_frame",
          name: "Farcaster Radio",
          url: "https://farcaster-radio.vercel.app",
          splashImageUrl: "https://farcaster-radio.vercel.app/splash.png",
          splashBackgroundColor: "#0a0a0a",
        },
      },
    }),
  },
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
