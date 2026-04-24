import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import RoomLayoutWrapper from "@/components/RoomLayoutWrapper";
import BrandingHeader from "@/components/BrandingHeader";
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
          <SettingsProvider>
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:top-0 focus:left-0"
            >
              Langsung ke konten utama
            </a>
            
            <RoomLayoutWrapper>
              <BrandingHeader />
            </RoomLayoutWrapper>

            <main id="main-content" className="flex-grow flex flex-col">
              {children}
            </main>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}