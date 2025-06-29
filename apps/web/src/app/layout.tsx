'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "../components/molecules/navbar/Navbar";
import { Footer } from '@/components/atoms/footer/Footer';
import { Toaster } from "@/components/ui/sonner";
import { Providers } from './providers';
import { AuthSync } from '@/components/atoms/auth/AuthSync';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen bg-gray-50/50 dark:bg-gray-950">
        <Providers>
          <AuthSync />
          {!isDashboard && <Navbar />}  
          <main className="flex-grow">
            {children}
          </main>
          {!isDashboard && <Footer />} 
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}