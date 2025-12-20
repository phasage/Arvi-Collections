import React from 'react'

const SecurityBadge = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900">Secure Shopping</p>
            <p className="text-xs text-gray-500">SSL Encrypted</p>
          </div>
        </div>
        
        <div className="mt-2 flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">Protected</span>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Your data is safe with us
        </div>
      </div>
    </div>
  )
}

export default SecurityBadge