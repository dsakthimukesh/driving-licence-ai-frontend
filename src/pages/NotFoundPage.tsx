import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-6 shadow-xl">
        <FileQuestion className="h-10 w-10" />
      </div>

      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="text-xl font-semibold text-slate-300 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved to another route.
      </p>

      <div className="mt-8">
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
