"use client";
import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import AuthDialog from "@/components/AuthDialog";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useState } from "react";

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const { data: session, status } = useSession();
  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1rem', 
      borderBottom: '1px solid #333', 
      background: '#181920',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', textDecoration: 'none', letterSpacing: 1 }}>StackIt</Link>
        <Link href="/" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
      </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <NotificationDropdown />
          {/* User avatar or login button */}
          {status === 'loading' ? null : session ? (
            <ProfileDropdown />
          ) : (
            <button onClick={() => setAuthOpen(true)} style={{ background: '#2d7be5', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 14 }}>Login</button>
          )}
        </div>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={() => window.location.reload()} />
    </nav>
  );
} 