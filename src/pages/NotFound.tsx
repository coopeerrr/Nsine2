import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search, Stethoscope } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-12 w-12 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">N-Sine</span>
          </div>
        </div>

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-blue-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-6 shadow-lg">
              <Search className="h-16 w-16 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Oops! The medical equipment page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Browse Products
            </Link>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Contact Support
            </Link>
            <Link
              to="/admin"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Medical Equipment Categories */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              to="/products?category=diagnostic"
              className="text-gray-600 hover:text-blue-600 hover:underline"
            >
              Diagnostic Equipment
            </Link>
            <Link
              to="/products?category=surgical"
              className="text-gray-600 hover:text-blue-600 hover:underline"
            >
              Surgical Instruments
            </Link>
            <Link
              to="/products?category=monitoring"
              className="text-gray-600 hover:text-blue-600 hover:underline"
            >
              Patient Monitoring
            </Link>
            <Link
              to="/products?category=laboratory"
              className="text-gray-600 hover:text-blue-600 hover:underline"
            >
              Laboratory Equipment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}