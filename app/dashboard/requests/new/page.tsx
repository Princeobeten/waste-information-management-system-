'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const SERVICE_TYPES = [
  'General Waste Collection',
  'Recyclable Waste Collection',
  'Electronic Waste Disposal',
  'Hazardous Waste Removal',
  'Waste Bin Replacement',
  'Area Cleaning Request',
  'Other'
];

const CAMPUS_LOCATIONS = [
  'Administration Block',
  'Science Block',
  'Arts Block',
  'Social Science Block',
  'Engineering Block',
  'Medical Block',
  'Library',
  'Student Center',
  'Sports Complex',
  'Cafeteria',
  'Hostel A',
  'Hostel B',
  'Hostel C',
  'Staff Quarters',
  'Other'
];

export default function NewRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    serviceType: '',
    location: '',
    description: ''
  });
  const [otherServiceType, setOtherServiceType] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Prepare data
    const requestData = {
      ...formData,
      serviceType: formData.serviceType === 'Other' ? otherServiceType : formData.serviceType,
      location: formData.location === 'Other' ? otherLocation : formData.location
    };
    
    // Validate
    if (formData.serviceType === 'Other' && !otherServiceType) {
      setError('Please specify the service type');
      setIsLoading(false);
      return;
    }
    
    if (formData.location === 'Other' && !otherLocation) {
      setError('Please specify the location');
      setIsLoading(false);
      return;
    }
    
    if (!requestData.description.trim()) {
      setError('Please provide a description');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create request');
      }
      
      // Redirect to the requests list
      router.push('/dashboard/requests');
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
      setIsLoading(false);
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
        <h1 className="text-2xl font-semibold text-gray-900">Create New Request</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
              Service Type *
            </label>
            <div className="mt-1">
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                required
              >
                <option value="">Select a service type</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {formData.serviceType === 'Other' && (
              <div className="mt-2">
                <label htmlFor="otherServiceType" className="block text-sm font-medium text-gray-700">
                  Please specify *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="otherServiceType"
                    value={otherServiceType}
                    onChange={(e) => setOtherServiceType(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <div className="mt-1">
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                required
              >
                <option value="">Select a location</option>
                {CAMPUS_LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            {formData.location === 'Other' && (
              <div className="mt-2">
                <label htmlFor="otherLocation" className="block text-sm font-medium text-gray-700">
                  Please specify *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="otherLocation"
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide details about your request..."
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link
              href="/dashboard/requests"
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
