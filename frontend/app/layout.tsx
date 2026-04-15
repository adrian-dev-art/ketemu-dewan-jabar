import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import RoomLayoutWrapper from "@/components/RoomLayoutWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "DPRD HUDANG - Konferensi Video",
  description: "Aplikasi konferensi video yang aman dan efektif untuk aspirasi masyarakat bersama DPRD HUDANG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <AuthProvider>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:top-0 focus:left-0"
          >
            Langsung ke konten utama
          </a>
          
          <RoomLayoutWrapper>
            <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <h1 className="text-base font-bold tracking-tight">
                    DPRD<span className="text-primary">HUDANG</span>
                  </h1>
                </Link>
                
                <nav className="flex items-center gap-3">
                  <Navbar />
                  <div className="w-px h-4 bg-border hidden sm:block mx-1" />
                  <ThemeToggle />
                </nav>
              </div>
            </header>
          </RoomLayoutWrapper>

          <main id="main-content" className="flex-grow flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}