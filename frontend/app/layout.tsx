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
        
        <header className="bg-primary text-white p-6 shadow-lg relative border-b-4 border-secondary">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
              <div className="w-2 h-8 bg-secondary rounded-full"></div>
              MEETDEWAN
            </h1>
            <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase">
              DPRD JABAR
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}