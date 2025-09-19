import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trash2, Recycle, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-green-600 text-white">
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <Recycle size={32} className="text-white" />
            <h1 className="text-2xl font-bold">WIMS UNICROSS</h1>
          </div>
          
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm bg-white text-green-600 rounded hover:bg-green-50 transition-colors font-semibold">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm border border-white text-white rounded hover:bg-white/10 transition-colors font-semibold">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-16 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Waste Information Management System</h2>
              <p className="text-lg md:text-xl mb-8">Streamlining waste management processes at the University of Cross River State</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-full hover:bg-green-50 transition-colors font-semibold">
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Recycle size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Request Service</h3>
                <p className="text-gray-600">Submit waste management service requests easily through our streamlined interface.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor the status of your service requests in real-time with notifications.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Manage Waste</h3>
                <p className="text-gray-600">Comprehensive tools for administrators to manage waste disposal efficiently.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© {new Date().getFullYear()} Waste Information Management System - UNICROSS</p>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm text-gray-300 hover:text-white transition-colors">
                Register
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
