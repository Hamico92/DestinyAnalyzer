import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata = {
  title: "Destiny Ψ Analyzer",
  description: "Speculative decision reflection tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
