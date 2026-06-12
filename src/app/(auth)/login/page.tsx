'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      // Refresh auth context so the app shell knows about the new session
      await refresh();
      router.push('/dashboard');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md fade-up">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="mono text-xs font-bold text-black">M</span>
          </div>
          <span className="mono text-sm font-medium tracking-widest" style={{ color: 'var(--accent)' }}>MACROS</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Sign in to continue tracking</p>

        <div className="card flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <div className="error-msg">{error}</div>}
          <Button onClick={handleSubmit} disabled={loading} fullWidth className="mt-1">
            {loading ? 'Signing in...' : 'Sign in →'}
          </Button>
        </div>

        <div className="divider my-6">or</div>
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Do not have an account?{' '}
          <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
