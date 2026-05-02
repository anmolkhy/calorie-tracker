'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard', label: 'Today', icon: '◉' },
  { href: '/history', label: 'History', icon: '▦' },
  { href: '/meals', label: 'Meals', icon: '◈' },
  { href: '/foods', label: 'Foods', icon: '◎' },
  { href: '/settings', label: 'Goals', icon: '◇' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <span className="mono text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Top nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ background: 'var(--accent)' }} />
          <span className="mono text-sm font-medium" style={{ color: 'var(--accent)' }}>MACROS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.name}</span>
          <button
            onClick={logout}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ color: 'var(--text-dim)', border: '1px solid var(--border)' }}
          >
            out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        {NAV.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors"
              style={{ color: active ? 'var(--accent)' : 'var(--text-dim)' }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-xs mono">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}