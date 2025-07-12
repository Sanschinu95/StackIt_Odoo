import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StackIt',
  description: 'Minimal Q&A Forum Platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#181920', color: '#e0e0e0', minHeight: '100vh' }}>
        <SessionProviderWrapper>
          <Navbar />
          <main style={{ 
            maxWidth: 800, 
            margin: '1rem auto', 
            padding: '1rem', 
            background: '#23242b', 
            borderRadius: 16, 
            minHeight: '80vh', 
            boxShadow: '0 2px 16px #0002',
            width: '95%'
          }}>
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
