'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/todos';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(()=>({}));
      setErr(data?.message || 'Login failed');
      return;
    }
    router.replace(next);
  }

  return (
    <div className="mx-auto grid max-w-sm gap-4">
      <div className="card p-6">
        <h1 className="text-xl font-semibold flex items-center gap-2"><LogIn className="h-5 w-5" /> Login</h1>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
}
