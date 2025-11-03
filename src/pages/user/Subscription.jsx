import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Subscription = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubscribe = () => {
    // Navigate to documents page after subscription
    navigate('/documents')
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Get Access to Premium Documents
          </h1>
          <p className="text-lg text-gray-600">
            Subscribe now to access our exclusive collection of documents and resources
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Access</h2>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                $29.99
                <span className="text-lg font-normal text-gray-500">/lifetime</span>
              </div>
              <p className="text-gray-500">One-time payment • Lifetime access</p>
            </div>

            <div className="mb-8">
              <ul className="space-y-4 text-left">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Access to all premium documents
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Download and view offline
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Regular content updates
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  No recurring fees
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  24/7 support access
                </li>
              </ul>
            </div>

            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200"
            >
              Subscribe Now
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Secure payment • 30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Subscription