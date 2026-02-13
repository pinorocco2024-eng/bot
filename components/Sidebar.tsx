
import React from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'editor' | 'preview') => void;
  onCreateNew: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onCreateNew }) => {
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 text-indigo-600 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <i className="fas fa-robot text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">SiteBot AI</span>
        </div>

        <button 
          onClick={onCreateNew}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mb-8"
        >
          <i className="fas fa-plus"></i>
          New Bot
        </button>

        <nav className="space-y-1">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-th-large w-5"></i>
            Dashboard
          </button>
          
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 opacity-50 cursor-not-allowed"
          >
            <i className="fas fa-chart-line w-5"></i>
            Analytics
          </button>

          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 opacity-50 cursor-not-allowed"
          >
            <i className="fas fa-cog w-5"></i>
            Settings
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-900">Admin Account</p>
            <p className="text-[10px] text-slate-500">Pro Plan</p>
          </div>
          <i className="fas fa-sign-out-alt text-slate-400 cursor-pointer hover:text-slate-600"></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
