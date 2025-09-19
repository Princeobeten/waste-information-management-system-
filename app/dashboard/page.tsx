'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import { PlusCircle, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface RequestSummary {
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [requestSummary, setRequestSummary] = useState<RequestSummary>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all requests to calculate summary
        const response = await fetch('/api/requests');
        const data = await response.json();
        
        if (data.success && data.requests) {
          const summary = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0
          };
          
          data.requests.forEach((req: any) => {
            if (req.status === 'pending') summary.pending++;
            else if (req.status === 'in-progress') summary.inProgress++;
            else if (req.status === 'completed') summary.completed++;
            else if (req.status === 'rejected') summary.rejected++;
          });
          
          setRequestSummary(summary);
          
          // Get the 5 most recent requests
          const recent = data.requests.slice(0, 5);
          setRecentRequests(recent);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          href="/dashboard/requests/new"
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
        >
          <PlusCircle className="h-5 w-5" />
          New Request
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Welcome, {user?.name}!</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{requestSummary.pending}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{requestSummary.inProgress}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{requestSummary.completed}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{requestSummary.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Recent Requests</h3>
              
              {recentRequests.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Service Type
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Location
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {recentRequests.map((request) => (
                        <tr key={request._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                            <Link 
                              href={`/dashboard/requests/${request._id}`}
                              className="font-medium text-green-600 hover:text-green-700"
                            >
                              {request.serviceType}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {request.location}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600">You haven't submitted any requests yet.</p>
                  <Link
                    href="/dashboard/requests/new"
                    className="mt-2 inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Submit your first request</span>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
