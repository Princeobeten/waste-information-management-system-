'use client';

import { useAuth } from '@/lib/authContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, User, LogOut, Home, Inbox, Settings, Loader2, ClipboardList, X } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch notification count
      fetch('/api/notifications?read=false')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.notifications) {
            setNotificationCount(data.notifications.length);
          }
        })
        .catch((error) => {
          console.error('Error fetching notifications:', error);
        });
    }
  }, [isAuthenticated, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-white border-r ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-semibold text-green-600">WIMS</span>
            <span className="ml-2 text-sm font-medium text-gray-500">UNICROSS</span>
          </Link>
          <button 
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-4 py-6">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md group"
            >
              <Home className="h-5 w-5 mr-3 text-gray-500 group-hover:text-green-500" />
              Dashboard
            </Link>
            
            <Link
              href="/dashboard/requests"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md group"
            >
              <Inbox className="h-5 w-5 mr-3 text-gray-500 group-hover:text-green-500" />
              Service Requests
            </Link>
            
            {user?.role === 'admin' && (
              <>
                <Link
                  href="/dashboard/admin/requests"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md group"
                >
                  <ClipboardList className="h-5 w-5 mr-3 text-gray-500 group-hover:text-green-500" />
                  Manage Requests
                </Link>
                
                <Link
                  href="/dashboard/users"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md group"
                >
                  <User className="h-5 w-5 mr-3 text-gray-500 group-hover:text-green-500" />
                  Manage Users
                </Link>
              </>
            )}
            
            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md group"
            >
              <Settings className="h-5 w-5 mr-3 text-gray-500 group-hover:text-green-500" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              className="lg:text-white p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center justify-end gap-4">
              <Link href="/dashboard/notifications" className="relative p-1">
                <Bell className="h-6 w-6 text-gray-500 hover:text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user?.name}
                </span>
              </div>
              
              <button
                onClick={() => logout()}
                className="p-1 text-gray-500 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
