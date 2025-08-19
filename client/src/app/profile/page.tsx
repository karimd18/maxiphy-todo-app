import { backendFetch } from '@/lib/serverFetch';
import { User } from '@/types';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import { UserCog } from 'lucide-react';

export const metadata = { title: 'Profile — Maxiphy Todo' };

export default async function ProfilePage() {
  const me = await backendFetch<User>('/auth/me');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card p-6">
        <h1 className="text-xl font-semibold flex items-center gap-2"><UserCog className="h-5 w-5" /> Profile</h1>
        <div className="mt-4">
          <ProfileForm me={me} />
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold">Security</h2>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
