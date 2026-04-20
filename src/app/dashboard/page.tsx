import React from 'react';
import { logout } from '@/actions/auth';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const session = await decrypt(sessionCookie);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 font-sans text-zinc-100 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
          Welcome to the Dashboard
        </h1>
        
        <p className="text-zinc-400 text-lg">
          You are successfully authenticated. Your user ID is:
          <br />
          <span className="font-mono text-cyan-300 bg-zinc-900 px-3 py-1 rounded inline-block mt-2">
            {session?.userId || 'Unknown'}
          </span>
        </p>

        <form action={logout}>
          <button
            type="submit"
            className="mt-8 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 rounded-xl font-medium transition-colors border border-zinc-700 hover:border-zinc-600"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
