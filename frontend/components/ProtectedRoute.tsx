"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard if they try to access a forbidden area
        if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'dewan') router.push('/dewan');
        else router.push('/masyarakat');
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-ping absolute inset-0 w-12 h-12 bg-primary/20 rounded-full"></div>
            <div className="relative w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
              <Loader2 size={24} className="animate-spin" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Memverifikasi Sesi...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
