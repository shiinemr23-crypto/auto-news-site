import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: { default: "Wireline — Global News, Clearly", template: "%s | Wireline" },
  description: "AI-assisted summaries and multi-source briefings from global reporting.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>;
}
