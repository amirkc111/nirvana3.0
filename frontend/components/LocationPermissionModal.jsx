"use client";

import { useTheme } from "../contexts/ThemeContext";

const LocationPermissionModal = ({ isOpen, onAllow, onDeny, ipLocation }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDeny}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-md mx-auto ${currentTheme.colors.surface} ${currentTheme.colors.border} rounded-2xl shadow-2xl border backdrop-blur-xl`}
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.surface.replace('bg-', '')} 0%, ${currentTheme.colors.surface.replace('bg-', '')}/80 100%)`
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentTheme.colors.primary} flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${currentTheme.colors.text}`}>
                Weather Location Access
              </h3>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>
                Enhanced weather experience
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-3">
            <p className={`${currentTheme.colors.textSecondary} leading-relaxed`}>
              To provide accurate weather data for your location, please allow location access.
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-6 pb-6 flex space-x-3">
          <button
            onClick={onDeny}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${currentTheme.colors.surface} ${currentTheme.colors.border} border ${currentTheme.colors.text} hover:${currentTheme.colors.hover}`}
          >
            Decline
          </button>
          <button
            onClick={onAllow}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r ${currentTheme.colors.primary} text-white hover:opacity-90 shadow-lg`}
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
