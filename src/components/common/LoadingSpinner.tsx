import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative h-10 w-10">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-blue-100"></div>
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      {message && <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return <div className="py-8 flex justify-center">{content}</div>;
};
