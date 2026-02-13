
import React, { useState, useEffect } from 'react';
import { BotConfig } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BotEditor from './components/BotEditor';
import BotPreview from './components/BotPreview';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [currentBotId, setCurrentBotId] = useState<string | null>(null);

  // Persistence (Simulating Database)
  useEffect(() => {
    const savedBots = localStorage.getItem('sitebot_ai_bots');
    if (savedBots) {
      setBots(JSON.parse(savedBots));
    }
  }, []);

  const saveBots = (newBots: BotConfig[]) => {
    setBots(newBots);
    localStorage.setItem('sitebot_ai_bots', JSON.stringify(newBots));
  };

  const handleCreateBot = () => {
    setCurrentBotId(null);
    setView('editor');
  };

  const handleEditBot = (id: string) => {
    setCurrentBotId(id);
    setView('editor');
  };

  const handlePreviewBot = (id: string) => {
    setCurrentBotId(id);
    setView('preview');
  };

  const handleSaveBot = (config: BotConfig) => {
    const existing = bots.find(b => b.id === config.id);
    let newBots;
    if (existing) {
      newBots = bots.map(b => b.id === config.id ? config : b);
    } else {
      newBots = [...bots, config];
    }
    saveBots(newBots);
    setView('dashboard');
  };

  const handleDeleteBot = (id: string) => {
    if (confirm('Are you sure you want to delete this bot?')) {
      const newBots = bots.filter(b => b.id !== id);
      saveBots(newBots);
    }
  };

  const activeBot = bots.find(b => b.id === currentBotId);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        currentView={view} 
        onNavigate={(v) => setView(v)} 
        onCreateNew={handleCreateBot}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto h-full">
          {view === 'dashboard' && (
            <Dashboard 
              bots={bots} 
              onEdit={handleEditBot} 
              onPreview={handlePreviewBot} 
              onDelete={handleDeleteBot}
              onCreate={handleCreateBot}
            />
          )}

          {view === 'editor' && (
            <BotEditor 
              existingBot={activeBot} 
              onSave={handleSaveBot} 
              onCancel={() => setView('dashboard')} 
            />
          )}

          {view === 'preview' && activeBot && (
            <BotPreview 
              bot={activeBot} 
              onBack={() => setView('dashboard')} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
