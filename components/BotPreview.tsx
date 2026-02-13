
import React, { useState, useEffect, useRef } from 'react';
import { BotConfig, Message } from '../types';
import { chatWithBot } from '../services/geminiService';

interface BotPreviewProps {
  bot: BotConfig;
  onBack: () => void;
}

interface MessageWithSources extends Message {
  sources?: any[];
}

const BotPreview: React.FC<BotPreviewProps> = ({ bot, onBack }) => {
  const [messages, setMessages] = useState<MessageWithSources[]>([
    { id: '1', role: 'model', text: bot.welcomeMessage, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: MessageWithSources = {
      id: Math.random().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatWithBot(bot, messages, input);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        text: result.text,
        sources: result.sources,
        timestamp: Date.now()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting to the brain.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const installationCode = `<script src="https://sitebot-ai.com/widget.js" 
  data-bot-id="${bot.id}" 
  data-theme="${bot.themeColor.replace('#', '')}">
</script>`;

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Preview: {bot.name}</h1>
            <p className="text-sm text-slate-500">Test your assistant before deploying.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Chat Interface */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 flex items-center gap-3 border-b border-slate-100" style={{ backgroundColor: bot.themeColor }}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <i className="fas fa-robot"></i>
            </div>
            <div className="text-white">
              <p className="font-bold text-sm leading-tight">{bot.name}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <p className="text-[10px] font-medium opacity-80">Online & Ready</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                    {m.sources.map((chunk: any, idx: number) => chunk.web && (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-200 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      >
                        <i className="fas fa-link"></i>
                        {chunk.web.title || 'Source'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-400 px-4 py-2 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none flex gap-1">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">Powered by SiteBot AI</p>
          </div>
        </div>

        {/* Installation & Info */}
        <div className="space-y-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-code text-indigo-600"></i>
              Codice d'Integrazione
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Copia questo script e incollalo nel tag <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code> del tuo sito per attivare il bot.
            </p>
            <div className="relative group">
              <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
                {installationCode}
              </pre>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(installationCode);
                  alert('Copiato negli appunti!');
                }}
                className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-bold mb-2">Connessione al Dominio</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Il bot è configurato per monitorare <strong>{bot.websiteUrl}</strong>. Grazie al Grounding, troverà automaticamente informazioni aggiornate sul tuo sito.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <i className="fas fa-search text-[10px]"></i>
                </div>
                <p className="text-xs text-indigo-50 font-medium">Ricerca live abilitata sul dominio</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <i className="fas fa-sync text-[10px]"></i>
                </div>
                <p className="text-xs text-indigo-50 font-medium">Sincronizzazione automatica snippet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotPreview;
