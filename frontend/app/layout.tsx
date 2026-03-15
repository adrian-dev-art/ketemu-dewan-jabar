import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ketemu Dewan - Konferensi Video",
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
        
        <header className="sticky top-0 z-40 w-full glass border-b border-border">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-xl">K</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                KETEMU<span className="text-primary italic">DEWAN</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-primary/10">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                  DPRD JABAR • LIVE
                </span>
              </div>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-grow flex flex-col relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}