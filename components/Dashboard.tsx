
import React from 'react';
import { BotConfig } from '../types';

interface DashboardProps {
  bots: BotConfig[];
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ bots, onEdit, onPreview, onDelete, onCreate }) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bots</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your AI assistants.</p>
        </div>
        <button 
          onClick={onCreate}
          className="md:hidden py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium"
        >
          Create Bot
        </button>
      </div>

      {bots.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-robot text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No bots found</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven't created any AI assistants yet. Start by configuring your first bot for your website.
          </p>
          <button 
            onClick={onCreate}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100"
          >
            Create Your First Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: bot.themeColor }}>
                    <i className="fas fa-comment-dots text-xl"></i>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(bot.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => onDelete(bot.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{bot.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <i className="fas fa-link text-xs"></i>
                  {bot.websiteUrl}
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    bot.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bot.status}
                  </span>
                  <span className="text-[10px] text-slate-400">Created {new Date(bot.createdAt).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={() => onPreview(bot.id)}
                  className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-semibold rounded-xl transition-all border border-slate-100 group-hover:border-indigo-600"
                >
                  Test Assistant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
