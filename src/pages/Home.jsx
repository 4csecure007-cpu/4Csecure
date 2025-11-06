import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { signInWithGoogle } = useAuth()
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 min-h-[600px] flex items-center">
        {/* Background overlay with pattern */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-white space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Establish and Launch Your Business Venture in the UAE with us
              </h1>
              <div>
                <button className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                  Access Now →
                </button>
              </div>
            </div>

            {/* Right Side - Google Sign In Card */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-8 lg:p-10 shadow-2xl border-2 border-red-400/50 backdrop-blur-sm">
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3">
                    Start Your Journey Here!
                  </h2>
                  <p className="text-white/90 text-sm lg:text-base">
                    Sign in to access our comprehensive business setup guide
                  </p>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <button
                    onClick={signInWithGoogle}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 lg:py-4 px-4 lg:px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 lg:space-x-3 group"
                  >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-base lg:text-lg">Continue with Google</span>
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/30"></div>
                    </div>
                    <div className="relative flex justify-center text-xs lg:text-sm">
                      <span className="px-3 lg:px-4 bg-red-600 text-white/70">Secure & Fast</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 lg:p-4 backdrop-blur-sm">
                    <p className="text-white/90 text-xs lg:text-sm text-center leading-relaxed">
                      By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Discover Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Professional Image */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070"
                  alt="Professional business team"
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-1 lg:order-2 text-white space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                What You'll Discover Inside the Guide
              </h2>
              <p className="text-lg text-gray-200">
                A comprehensive guide to establishing and launching businesses in the UAE. Collated by experts
                in the field, to help entrepreneurs, business owners save time, money and efforts.
                Find relevant and updated information on:
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Company Structures</h3>
                    <p className="text-gray-300">Mainland, Free Zone & Offshore</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Licensing Requirements</h3>
                    <p className="text-gray-300">Choose the right activity and licence</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Legal & Regulatory Compliance</h3>
                    <p className="text-gray-300">Going by the book</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Step-by-Step Application Process</h3>
                    <p className="text-gray-300">From documentation and preapprovals to licence</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Business Essentials</h3>
                    <p className="text-gray-300">
                      Industry specific, Authority approvals, Certifications, Banking, Immigration
                      services, Customs, Offices and warehousing
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Market Insights</h3>
                    <p className="text-gray-300">Market dynamics explained</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Access Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
