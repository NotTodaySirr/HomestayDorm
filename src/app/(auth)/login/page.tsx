"use client";
import React, { useActionState } from 'react';
import { login } from '@/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[60%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[10%] w-[30%] h-[30%] rounded-full bg-cyan-600/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-xl bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
              Welcome Back
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Log in to your account to continue
            </p>
          </div>

          <form action={action} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 group-hover:border-zinc-700"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-rose-400 text-xs ml-1 font-medium">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <Link href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 group-hover:border-zinc-700"
                />
              </div>
              {state?.errors?.password && (
                 <p className="text-rose-400 text-xs ml-1 font-medium">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Global Error Banner */}
            {state?.message && !state?.errors && (
               <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 {state.message}
               </div>
            )}

            {/* Submit Button */}
            <button
              disabled={isPending}
              type="submit"
              className="w-full relative group overflow-hidden bg-zinc-100 text-zinc-900 rounded-xl py-3 font-semibold transition-all duration-300 hover:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging In...
                  </>
                ) : 'Log In'}
              </span>
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
