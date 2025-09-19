'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Loader2, Filter } from 'lucide-react';

interface ServiceRequest {
  _id: string;
  serviceType: string;
  location: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function RequestsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchRequests = async (status?: string) => {
    setIsLoading(true);
    try {
      let url = '/api/requests';
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchRequests(status);
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter requests by search term
  const filteredRequests = requests.filter(request => 
    request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">Service Requests</h1>
        <Link
          href="/dashboard/requests/new"
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 w-full sm:w-auto justify-center sm:justify-start"
        >
          <PlusCircle className="h-5 w-5" />
          New Request
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Loading requests...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Service Type
                  </th>
                  <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      <Link 
                        href={`/dashboard/requests/${request._id}`}
                        className="font-medium text-green-600 hover:text-green-700"
                      >
                        {request.serviceType}
                      </Link>
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {request.location}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">No requests found. {searchTerm ? 'Try a different search term.' : 'Create your first request!'}</p>
            {!searchTerm && (
              <Link
                href="/dashboard/requests/new"
                className="mt-2 inline-flex items-center gap-1 text-green-600 hover:text-green-700"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create a request</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
