
import React, { useState, useEffect } from 'react';
import { BotConfig } from '../types';
import { generateInitialConfig, summarizePDF } from '../services/geminiService';

interface BotEditorProps {
  existingBot?: BotConfig;
  onSave: (config: BotConfig) => void;
  onCancel: () => void;
}

const BotEditor: React.FC<BotEditorProps> = ({ existingBot, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [aiStep, setAiStep] = useState(existingBot ? 2 : 1); // 1: Initial AI info, 2: Deep config
  
  const [formData, setFormData] = useState<BotConfig>(existingBot || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    websiteUrl: '',
    systemPrompt: '',
    knowledgeText: '',
    status: 'draft',
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    themeColor: '#4f46e5',
    welcomeMessage: 'Hello! How can I help you today?',
  });

  const [description, setDescription] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleMagicSetup = async () => {
    if (!formData.websiteUrl || !description) return;
    setLoading(true);
    try {
      const config = await generateInitialConfig(formData.websiteUrl, description);
      setFormData(prev => ({
        ...prev,
        ...config,
        status: 'active'
      }));
      setAiStep(2);
    } catch (e) {
      alert("AI was unable to generate config. Please fill manually.");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const summary = await summarizePDF(base64);
        setFormData(prev => ({
          ...prev,
          knowledgeText: prev.knowledgeText + "\n\n--- CONTENT FROM PDF: " + file.name + " ---\n" + summary
        }));
      } catch (err) {
        alert("Could not process PDF.");
      } finally {
        setUploadingPdf(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {existingBot ? 'Edit Assistant' : 'Build Your Assistant'}
        </h1>
      </div>

      {aiStep === 1 ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <i className="fas fa-magic"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Magic Setup</h2>
              <p className="text-sm text-slate-500">Tell us about your site and we'll configure the AI for you.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Website URL</label>
              <input 
                type="url" 
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">What does your website do?</label>
              <textarea 
                rows={4}
                placeholder="e.g. We sell artisanal coffee beans and brewing equipment. We offer free shipping over $50."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                disabled={loading || !formData.websiteUrl || !description}
                onClick={handleMagicSetup}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>}
                {loading ? 'AI is Thinking...' : 'Generate Configuration'}
              </button>
              <button 
                onClick={() => setAiStep(2)}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
              >
                Manual Setup
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Identity Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Bot Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bot Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={formData.themeColor}
                    onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                    className="h-12 w-20 rounded-xl cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={formData.themeColor}
                    onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Behavior & Knowledge</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Welcome Message</label>
                <input 
                  type="text" 
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">System Instructions</label>
                <textarea 
                  rows={4}
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Describe how the bot should behave..."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Knowledge Base (Extracted Context)</label>
                  <label className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline flex items-center gap-1">
                    {uploadingPdf ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                    {uploadingPdf ? 'Processing...' : 'Upload PDF for knowledge'}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={uploadingPdf} />
                  </label>
                </div>
                <textarea 
                  rows={8}
                  value={formData.knowledgeText}
                  onChange={(e) => setFormData({...formData, knowledgeText: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm bg-slate-50 font-mono"
                  placeholder="Paste additional context, FAQs, or upload PDFs above..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => onSave(formData)}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all"
            >
              Save Assistant
            </button>
            <button 
              onClick={onCancel}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotEditor;
