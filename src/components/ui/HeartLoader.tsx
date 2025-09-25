'use client';

import React from 'react';

interface HeartLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const HeartLoader: React.FC<HeartLoaderProps> = ({ 
  size = 'md', 
  color = '#E7654D', // Brand orange color
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-9',
    md: 'w-10 h-15',
    lg: 'w-16 h-24'
  };

  return (
    <div className={`heart-loader ${sizeClasses[size]} ${className}`}>
      <style jsx>{`
        .heart-loader {
          position: relative;
          animation: heartBeat 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        .heart-loader:before,
        .heart-loader:after {
          content: "";
          background: ${color};
          width: 100%;
          height: 100%;
          border-radius: 50px 50px 0 0;
          position: absolute;
          left: 0;
          bottom: 0;
          transform: rotate(45deg);
          transform-origin: 50% 68%;
          box-shadow: 5px 4px 5px rgba(0, 0, 0, 0.27) inset;
        }
        
        .heart-loader:after {
          transform: rotate(-45deg);
        }

        @keyframes heartBeat {
          0% { transform: scale(0.95); }
          5% { transform: scale(1.1); }
          39% { transform: scale(0.85); }
          45% { transform: scale(1); }
          60% { transform: scale(0.95); }
          100% { transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default HeartLoader;