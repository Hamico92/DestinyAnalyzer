import "./globals.css";
export const metadata = {
  title: "Destiny Ψ Analyzer",
  description: "Speculative decision reflection tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
