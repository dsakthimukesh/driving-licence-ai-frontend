import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export const TopNav: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
      {/* Title / Context info */}
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-slate-800">
          AI Document Intelligence
        </h2>
      </div>

      {/* User profile & Logout */}
      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-3">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name || 'User'}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {currentUser.email}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
          title="Sign out of account"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};
