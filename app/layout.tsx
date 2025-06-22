import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "./components/header-section/Header";
import { ViewProvider } from "@/contexts/ViewContext";

const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sujan Kharel",
  description:
    "Frontend Engineer specializing in React, Next.js, and TypeScript. Creating modern, responsive web experiences with a focus on performance and accessibility.",
  keywords: [
    "frontend",
    "react",
    "tech",
    "UI development",
    "frontend engineer",
    "developer portfolio",
    "creative development",
    "sujan kharel",
    "software developer",
    "software engineer",
    "portfolio",
  ],
  openGraph: {
    title: "Sujan Kharel",
    description:
      "Frontend Engineer specializing in React, Next.js, and TypeScript. Creating modern, responsive web experiences with a focus on performance and accessibility.",
    url: "https://www.kharelsujan.np.com",
    siteName: "www.kharelsujan.np.com",
    images: [
      {
        url: "https://i.ibb.co/FKMqc28/adeola-badero.png",
        width: 1200,
        height: 630,
        alt: "Sujan Kharel — Frontend Software Engineer",
      },
      {
        url: "https://i.ibb.co/Y8hBTR4/ade-800.png",
        width: 800,
        height: 800,
        alt: "Sujan Kharel — Frontend Software Engineer",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sujan Kharel — Software Engineer",
    description:
      "Frontend Engineer specializing in React, Next.js, and TypeScript. Creating modern, responsive web experiences with a focus on performance and accessibility.",
    creator: "@your_twitter_handle", // optional
    images: ["https://i.ibb.co/FKMqc28/adeola-badero.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      "max-image-preview": "large",
    },
  },
  category: "technology",
  icons: {
    icon: "/favicon.ico", // 👈 this sets the browser tab icon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kumbhSans.className} max-w-[90%] xl:max-w-[1223px] w-full mx-auto overflow-x-hidden`}
      >
        <>
          <ViewProvider>
            <Header />
            {children}
          </ViewProvider>
          <Analytics />
          <SpeedInsights />
        </>
      </body>
    </html>
  );
}
