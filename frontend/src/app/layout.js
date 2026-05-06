import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DataAnalystAI — Enterprise AI Data Analytics Platform",
  description: "AI-powered multi-agent data analyst platform. Upload datasets, get automated auditing, cleaning, EDA, visualizations, and business insights powered by collaborative AI agents.",
  keywords: "data analytics, AI, machine learning, business intelligence, data visualization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
