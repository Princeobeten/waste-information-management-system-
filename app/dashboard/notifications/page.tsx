'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, Loader2, AlertCircle, Bell, Check } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  requestId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
      
      setNotifications(data.notifications || []);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsRead = async (notificationIds: string[]) => {
    if (!notificationIds.length) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark notifications as read');
      }
      
      // Update local state
      setNotifications(
        notifications.map(notification => 
          notificationIds.includes(notification._id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(notification => !notification.read)
      .map(notification => notification._id);
    
    await markAsRead(unreadIds);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // If notification is from today, show only time
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If notification is from yesterday, show "Yesterday" + time
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            href="/dashboard" 
            className="mr-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        </div>
        
        {notifications.some(notification => !notification.read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="mt-4 text-gray-600">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="p-6 flex items-start gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm">{error}</p>
              <button 
                onClick={fetchNotifications}
                className="mt-2 text-sm font-medium text-green-600 hover:text-green-500"
              >
                Try again
              </button>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`p-4 flex ${!notification.read ? 'bg-green-50' : ''}`}
            >
              <div className={`p-2 rounded-full ${!notification.read ? 'bg-green-100' : 'bg-gray-100'} mr-4`}>
                <Bell className={`h-5 w-5 ${!notification.read ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                
                <div className="mt-2 flex">
                  {notification.requestId && (
                    <Link 
                      href={`/dashboard/requests/${notification.requestId}`}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      View Request
                    </Link>
                  )}
                  
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead([notification._id])}
                      className={`text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center ${notification.requestId ? 'ml-4' : ''}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any notifications yet. They'll appear here when there are updates to your service requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
