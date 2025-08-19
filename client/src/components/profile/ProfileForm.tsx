'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { User } from '@/types';

export default function ProfileForm({ me }: { me: User }) {
  const r = useRouter();
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setOk('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) {
      const d = await res.json().catch(()=>({}));
      setErr(d?.message || 'Update failed');
      return;
    }
    setOk('Profile updated');
    r.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input label="Name" value={name} onChange={e=>setName(e.target.value)} required />
      <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-green-700">{ok}</p>}
      <div>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
