import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TuneIn",
  description: "Live audio streaming on Farcaster",
  openGraph: {
    title: "TuneIn",
    description: "Live audio streaming on Farcaster. Create your own radio station or tune in to others.",
    images: ["https://farcaster-radio.vercel.app/splash.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://farcaster-radio.vercel.app/embed.png",
      button: {
        title: "Open TuneIn",
        action: {
          type: "launch_miniapp",
          name: "TuneIn",
          url: "https://farcaster-radio.vercel.app",
          splashImageUrl: "https://farcaster-radio.vercel.app/splash.png",
          splashBackgroundColor: "#0a0a0a",
        },
      },
    }),
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://farcaster-radio.vercel.app/embed.png",
      button: {
        title: "Open TuneIn",
        action: {
          type: "launch_frame",
          name: "TuneIn",
          url: "https://farcaster-radio.vercel.app",
          splashImageUrl: "https://farcaster-radio.vercel.app/splash.png",
          splashBackgroundColor: "#0a0a0a",
        },
      },
    }),
  },
};

import { Providers } from "@/components/providers";
import { MatrixBackground } from "@/components/ui/MatrixBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MatrixBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
