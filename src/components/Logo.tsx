import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
}

export default function Logo({ size = 'md', showText = true, showSubtitle = false }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'w-12 h-12', icon: 'w-8 h-8', badge: 'w-4 h-4', text: 'text-xl', subtitle: 'text-xs' },
    md: { container: 'w-24 h-24', icon: 'w-full h-full', badge: 'w-6 h-6', text: 'text-3xl', subtitle: 'text-sm' },
    lg: { container: 'w-32 h-32', icon: 'w-full h-full', badge: 'w-8 h-8', text: 'text-4xl', subtitle: 'text-base' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${currentSize.container} ${size === 'sm' ? 'mb-2' : 'mb-4'}`}>
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-3xl blur-md opacity-30 animate-pulse"></div>
        
        {/* Main logo container with modern design */}
        <div className={`relative w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-300 overflow-hidden`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]"></div>
          </div>
          
          {/* Main icon - Spaced out design for better visibility, no congestion */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px' }}>
            {/* Document/Resume - Well-sized document icon */}
            <svg className={`${size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-16 h-16' : 'w-20 h-20'}`} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            {/* Automation arrow - Positioned outside document, more visible */}
            <div className="absolute" style={{ top: size === 'sm' ? '-4px' : size === 'md' ? '-6px' : '-8px', left: '50%', transform: 'translateX(-50%)' }}>
              <svg className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  d="M5 12h14m-7-7l7 7-7 7" 
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            {/* Success checkmark - Positioned clearly inside document, not congested */}
            <div className="absolute" style={{ bottom: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px', left: '50%', transform: 'translateX(-50%)' }}>
              <svg className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  d="M5 13l4 4L19 7" 
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Top-right badge - automation indicator - Better visibility */}
          <div className={`absolute -top-2 -right-2 ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'} bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-3 border-white`} style={{ borderWidth: '3px', boxShadow: '0 4px 8px rgba(34, 197, 94, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.8)' }}>
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4.5 h-4.5' : 'w-6 h-6'} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Bottom-left accent - small dot for design */}
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-yellow-400 rounded-full shadow-lg"></div>
        </div>
      </div>
      
      {showText && (
        <>
          <h2 className={`text-center ${currentSize.text} font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent ${size === 'sm' ? 'mb-0.5' : 'mb-1'} tracking-tight drop-shadow-sm`}>
            APPLYTOMATION
          </h2>
          {showSubtitle && (
            <p className={`${currentSize.subtitle} text-gray-600 font-semibold tracking-wide`}>
              Smart Job Application Automation
            </p>
          )}
        </>
      )}
    </div>
  );
}

