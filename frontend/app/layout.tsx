import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
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
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        {/* Decorative Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] opacity-20 dark:opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full animate-pulse transition-all duration-1000"></div>
        </div>

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
                KETEMU<span className="text-primary italic font-black">DEWAN</span>
              </h1>
            </div>
            
            <nav className="flex items-center gap-4 md:gap-8">
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-primary/10">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                  DPRD JABAR • LIVE
                </span>
              </div>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-grow flex flex-col relative">
          {children}
        </main>
      </body>
    </html>
  );
}