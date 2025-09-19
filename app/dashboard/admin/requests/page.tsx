'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';

interface Request {
  _id: string;
  serviceType: string;
  location: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string; // Added to store the user's name
  userEmail: string; // Added to store the user's email
}

export default function AdminRequestsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    fetchRequests();
  }, [isAdmin, router]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/requests?includeUserDetails=true');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch requests');
      }
      
      if (data.success && data.requests) {
        setRequests(data.requests);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching requests');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    setUpdating(requestId);
    
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update request status');
      }
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId ? { ...req, status: status as any } : req
        )
      );
      
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating request status');
    } finally {
      setUpdating(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <RefreshCw className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(req => {
    // Apply status filter
    if (statusFilter !== 'all' && req.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter (case insensitive)
    if (searchTerm && !req.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !req.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !req.userName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !req.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Request Management</h1>
        <button
          onClick={fetchRequests}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchRequests}
              className="mt-2 text-sm font-medium text-green-600 hover:text-green-500"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 flex-grow md:max-w-md">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="mt-4 text-gray-600">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'No requests match your filters.' : 'No requests found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.userName || 'User'}</div>
                      <div className="text-sm text-gray-500">{request.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/dashboard/requests/${request._id}`}
                        className="font-medium text-green-600 hover:text-green-700"
                      >
                        {request.serviceType}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {updating === request._id ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          <span className="ml-2">Updating...</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {request.status !== 'pending' && (
                            <button
                              onClick={() => updateRequestStatus(request._id, 'pending')}
                              className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            >
                              Pending
                            </button>
                          )}
                          {request.status !== 'in-progress' && (
                            <button
                              onClick={() => updateRequestStatus(request._id, 'in-progress')}
                              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              In Progress
                            </button>
                          )}
                          {request.status !== 'completed' && (
                            <button
                              onClick={() => updateRequestStatus(request._id, 'completed')}
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              Complete
                            </button>
                          )}
                          {request.status !== 'rejected' && (
                            <button
                              onClick={() => updateRequestStatus(request._id, 'rejected')}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
