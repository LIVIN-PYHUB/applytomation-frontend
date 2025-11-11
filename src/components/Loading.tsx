import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  showNoData?: boolean;
}

export default function Loading({ message = 'Loading...', fullScreen = false, showNoData = false }: LoadingProps) {

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Inbox/Folder Icon */}
      {showNoData && (
        <div className="w-16 h-16 border-2 border-gray-300 rounded-lg relative">
          <div className="absolute top-0 left-0 w-full h-8 border-b-2 border-gray-300 rounded-t-lg">
            <div className="absolute top-2 left-2 w-3 h-3 border border-gray-300 rounded"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border border-gray-300 rounded"></div>
          </div>
        </div>
      )}
      
      {showNoData && (
        <p className="text-gray-400 text-sm font-normal">No data</p>
      )}
      
      {/* Loading dots animation - 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
      </div>
      
      {message && !showNoData && (
        <p className="text-gray-500 text-sm font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  );
}

// Inline loading spinner for buttons
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-white`} />
  );
}

