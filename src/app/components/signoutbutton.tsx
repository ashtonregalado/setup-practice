'use client';

import { signOut } from '../(auth)/actions';
import { useTransition } from 'react';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
