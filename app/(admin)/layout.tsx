import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import "../globals.css";

const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin — Sujan Kharel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${kumbhSans.className} bg-[#070d14] text-white`}>
        {children}
      </body>
    </html>
  );
}