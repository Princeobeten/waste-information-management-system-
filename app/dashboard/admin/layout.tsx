'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isAdmin, router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div>
      {children}
    </div>
  );
}
