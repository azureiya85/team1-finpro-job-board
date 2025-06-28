'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "../components/molecules/navbar/Navbar";
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
      <body className="antialiased">
        <Providers>
          <AuthSync />          
          {!isDashboard && <Navbar />}
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}