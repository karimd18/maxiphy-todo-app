'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(()=>({}));
      setErr(data?.message || 'Registration failed');
      return;
    }
    router.replace('/todos');
  }

  return (
    <div className="mx-auto grid max-w-sm gap-4">
      <div className="card p-6">
        <h1 className="text-xl font-semibold flex items-center gap-2"><UserPlus className="h-5 w-5" /> Register</h1>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <Input label="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit">Create account</Button>
        </form>
      </div>
    </div>
  );
}
