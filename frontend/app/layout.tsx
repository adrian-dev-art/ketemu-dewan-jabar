import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEETDEWAN - Konferensi Video",
  description: "Aplikasi konferensi video yang aman dan efektif untuk aspirasi masyarakat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Strategi Aksesibilitas: Lewati navigasi untuk pengguna keyboard */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:top-0 focus:left-0"
        >
          Langsung ke konten utama
        </a>
        
        <header className="bg-slate-900 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold tracking-wider">MEETDEWAN</h1>
          </div>
        </header>

        <main id="main-content" className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}