'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  authMethod: 'local' | 'ldap' | 'oauth';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  loginAttempts: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setFormData(prev => ({ ...prev, name: data.user.name }));
        } else if (response.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load profile');
        }
      } catch {
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData(prev => ({ ...prev, name: data.user.name }));
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load profile');
      }
    } catch {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    try {
      const updateData: { name: string; currentPassword?: string; newPassword?: string } = { 
        name: formData.name 
      };
      
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        await fetchProfile();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch {
      setError('Error updating profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="text-gray-600 mt-2">Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
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

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {user.authMethod === 'local' && (
                    <>
                      <hr className="my-6" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">Leave empty to keep current password</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(prev => ({
                          ...prev,
                          name: user.name,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        }));
                        setError('');
                        setSuccess('');
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-lg text-gray-900">{user.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="text-lg text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Authentication Method</label>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      user.authMethod === 'oauth' 
                        ? 'bg-green-100 text-green-800'
                        : user.authMethod === 'ldap'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.authMethod.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="text-sm text-gray-900">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Never'
                    }
                  </p>
                </div>

                {user.loginAttempts > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Failed Login Attempts</label>
                    <p className="text-sm text-red-600 font-medium">{user.loginAttempts}</p>
                  </div>
                )}
              </div>
            </div>

            {user.authMethod === 'local' && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Password authentication enabled
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Account lockout protection
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Secure password hashing
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
