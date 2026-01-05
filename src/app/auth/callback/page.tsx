'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      // Get the intended redirect URL or default based on user role
      const user = session.user as { role?: 'admin' | 'user' };
      const redirectTo = searchParams.get('callbackUrl') || 
                        (user.role === 'admin' ? '/admin' : '/dashboard');
      
      router.replace(redirectTo);
    } else if (status === 'unauthenticated') {
      // Redirect to login if authentication failed
      router.replace('/login?error=oauth_signin_failed');
    }
  }, [session, status, router, searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
          <p className="text-gray-600">Please wait while we redirect you.</p>
        </div>
      </div>
    );
  }

  return null;
}
