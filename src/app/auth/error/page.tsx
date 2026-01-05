'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

const errorMessages: Record<string, string> = {
  configuration: 'There was an issue with the server configuration.',
  accessdenied: 'Access was denied. You may not have permission to sign in.',
  verification: 'The verification link has expired or has already been used.',
  default: 'An unexpected error occurred during authentication.',
  oauth_signin_failed: 'OAuth sign in failed. Please try again.',
  oauth_account_not_linked: 'This account is not linked to your email. Please sign in with your original method.',
};

export default function AuthError() {
  const searchParams = useSearchParams();
  
  const { error, errorType } = useMemo(() => {
    const errorParam = searchParams.get('error') || 'default';
    return {
      errorType: errorParam,
      error: errorMessages[errorParam] || errorMessages.default
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600">We encountered an issue during sign in</p>
          </div>

          {/* Error Message */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            {errorType && (
              <p className="text-red-600 text-xs mt-2">Error code: {errorType}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200 font-medium text-center block"
            >
              Try Again
            </Link>
            
            <Link
              href="/register"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors duration-200 font-medium text-center block"
            >
              Create New Account
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
