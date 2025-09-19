'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Clock, 
  MapPin, 
  FileText, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface RequestDetailProps {
  params: {
    id: string;
  };
}

interface RequestData {
  _id: string;
  serviceType: string;
  location: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function RequestDetail({ params }: RequestDetailProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  
  useEffect(() => {
    fetchRequestDetails();
  }, []);
  
  const fetchRequestDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/requests/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch request details');
      }
      
      if (data.success && data.request) {
        setRequestData(data.request);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching request details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateRequestStatus = async (status: string) => {
    if (!user?.role || user.role !== 'admin') return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/requests/${id}`, {
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
      
      setRequestData(data.request);
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating request status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteRequest = async () => {
    if (!user?.role || user.role !== 'admin') return;
    
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete request');
      }
      
      // Redirect to the requests list
      router.push('/dashboard/requests');
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the request');
      setIsLoading(false);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'in-progress': return <RefreshCw className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href="/dashboard/requests" 
          className="mr-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Request Details</h1>
      </div>
      
      {isLoading && !requestData ? (
        <div className="bg-white shadow rounded-lg p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="mt-4 text-gray-600">Loading request details...</span>
        </div>
      ) : error ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm">{error}</p>
              <button 
                onClick={fetchRequestDetails}
                className="mt-2 text-sm font-medium text-green-600 hover:text-green-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : requestData ? (
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900">{requestData.serviceType}</h2>
            <div className="mt-1 flex items-center">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(requestData.status)}`}>
                {getStatusIcon(requestData.status)}
                <span className="ml-1">{requestData.status}</span>
              </span>
              <span className="text-sm text-gray-500 ml-4">
                <Calendar className="h-4 w-4 inline mr-1 opacity-70" />
                {formatDate(requestData.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Location</h3>
                  <p className="mt-1 text-sm text-gray-600">{requestData.location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 mt-0.5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Description</h3>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{requestData.description}</p>
                </div>
              </div>
            </div>
            
            {user?.role === 'admin' && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Actions</h3>
                
                <div className="flex flex-wrap gap-3">
                  {requestData.status !== 'pending' && (
                    <button 
                      onClick={() => updateRequestStatus('pending')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Mark as Pending
                    </button>
                  )}
                  
                  {requestData.status !== 'in-progress' && (
                    <button 
                      onClick={() => updateRequestStatus('in-progress')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Mark as In Progress
                    </button>
                  )}
                  
                  {requestData.status !== 'completed' && (
                    <button 
                      onClick={() => updateRequestStatus('completed')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Completed
                    </button>
                  )}
                  
                  {requestData.status !== 'rejected' && (
                    <button 
                      onClick={() => updateRequestStatus('rejected')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Mark as Rejected
                    </button>
                  )}
                  
                  <button 
                    onClick={deleteRequest}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Delete Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">Request not found or access denied.</p>
          <Link href="/dashboard/requests" className="mt-2 text-sm font-medium text-green-600 hover:text-green-500">
            Back to all requests
          </Link>
        </div>
      )}
    </div>
  );
}
