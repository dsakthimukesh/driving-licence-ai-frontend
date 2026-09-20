import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, FileSearch, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Documents',
      path: '/documents',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FileSearch className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-none">
            DocIntel AI
          </h1>
          <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400 flex items-center gap-1 mt-1">
            <Sparkles className="h-2.5 w-2.5" /> Driving Licence OCR
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="truncate">AI Document Intelligence v1.0</p>
      </div>
    </aside>
  );
};
