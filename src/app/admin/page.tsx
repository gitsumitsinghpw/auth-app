import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/login');
  }

  if (!session.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <span className="ml-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Admin Access
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                User View
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/api/auth/logout"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Admin Panel - Welcome, {session.user.name}!
              </h2>
              <p className="text-gray-600">
                You have full administrative access to manage users and system settings.
              </p>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">Loading...</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">Loading...</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">Loading...</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locked Accounts</p>
                <p className="text-2xl font-bold text-gray-900">Loading...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">View, edit, and manage user accounts</p>
                </div>
              </Link>

              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create User</p>
                  <p className="text-sm text-gray-500">Add new user accounts</p>
                </div>
              </div>

              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Role Management</p>
                  <p className="text-sm text-gray-500">Assign and modify user roles</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Management</h3>
            <div className="space-y-3">
              <Link
                href="/api/health"
                target="_blank"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">System Health</p>
                  <p className="text-sm text-gray-500">Check system status and metrics</p>
                </div>
              </Link>

              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Security Settings</p>
                  <p className="text-sm text-gray-500">Configure security policies</p>
                </div>
              </div>

              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">System Logs</p>
                  <p className="text-sm text-gray-500">View authentication and system logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Methods Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Methods Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Local Authentication</p>
                <p className="text-sm text-gray-500">Active - Email & Password</p>
              </div>
            </div>

            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">LDAP Authentication</p>
                <p className="text-sm text-gray-500">Active - Mock Implementation</p>
              </div>
            </div>

            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">OAuth Providers</p>
                <p className="text-sm text-gray-500">Active - Google & GitHub</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
