import Link from "next/link";
import { getSession } from '@/lib/session';
import { SessionData } from '@/lib/auth';
import { Suspense } from 'react';
import DevRateLimitClear from '@/components/DevRateLimitClear';

function WelcomeMessage({ session }: { session: SessionData }) {
  if (session.isLoggedIn && session.user) {
    return (
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-6">
          Welcome back, <span className="font-semibold text-blue-600">{session.user.name}</span>!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Go to {session.user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
          </Link>
          <Link
            href="/profile"
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            View Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-lg text-gray-600 mb-8">
        Welcome to our secure authentication platform. Please sign in or create an account to continue.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getSession();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Authentication Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A production-ready authentication system with multiple authentication methods, 
            role-based access control, and comprehensive security features.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <WelcomeMessage session={session} />
          </Suspense>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Multiple Auth Methods</h3>
            <p className="text-gray-600 text-sm">
              Support for local authentication, LDAP integration, and OAuth with Google & GitHub.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-2xl mb-4">🛡️</div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-600 text-sm">
              Password hashing, rate limiting, CSRF protection, and secure session management.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-2xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
            <p className="text-gray-600 text-sm">
              User and admin roles with protected routes and granular permissions.
            </p>
          </div>
        </div>

        {/* Authentication Methods */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Available Authentication Methods</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-medium mb-1">Local Authentication</h3>
              <p className="text-sm text-gray-600">Email and password with secure hashing</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">📁</div>
              <h3 className="font-medium mb-1">LDAP Integration</h3>
              <p className="text-sm text-gray-600">Corporate directory authentication</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="font-medium mb-1">OAuth Providers</h3>
              <p className="text-sm text-gray-600">Google and GitHub social login</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with Next.js, MongoDB, and comprehensive security features</p>
          <p className="mt-2">© 2026 Secure Authentication Platform. All rights reserved.</p>
        </footer>

        {/* Development Tools */}
        <DevRateLimitClear />
      </div>
    </div>
  );
}
