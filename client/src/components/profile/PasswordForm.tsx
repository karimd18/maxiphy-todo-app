'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function PasswordForm() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setOk('');
    const res = await fetch('/api/profile/password', {
      method: 'PATCH',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const d = await res.json().catch(()=>({}));
      setErr(d?.message || 'Password change failed');
      return;
    }
    setOk('Password updated');
    setCurrent(''); setNew('');
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input label="Current password" type="password" value={currentPassword} onChange={e=>setCurrent(e.target.value)} required />
      <Input label="New password" type="password" value={newPassword} onChange={e=>setNew(e.target.value)} required />
      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-green-700">{ok}</p>}
      <div>
        <Button type="submit">Update password</Button>
      </div>
    </form>
  );
}
