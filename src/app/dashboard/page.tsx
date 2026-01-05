import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/login');
  }

  if (!session.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {session.user.name}!
              </h2>
              <p className="text-gray-600">
                Role: <span className="capitalize font-medium text-blue-600">{session.user.role}</span>
              </p>
              <p className="text-sm text-gray-500">
                Authentication Method: <span className="capitalize">{session.user.authMethod}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Level</p>
                <p className="text-lg font-semibold text-blue-600">High</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Access Level</p>
                <p className="text-lg font-semibold text-purple-600">User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/profile"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Edit Profile</p>
              <p className="text-xs text-gray-500">Update your information</p>
            </Link>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 text-center cursor-pointer">
              <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Security Settings</p>
              <p className="text-xs text-gray-500">Manage security options</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 text-center cursor-pointer">
              <div className="w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Preferences</p>
              <p className="text-xs text-gray-500">Customize your experience</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200 text-center cursor-pointer">
              <div className="w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Help & Support</p>
              <p className="text-xs text-gray-500">Get assistance</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Successful login</p>
                <p className="text-xs text-gray-500">Just now - Current session</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Account created</p>
                <p className="text-xs text-gray-500">Registration completed successfully</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
