import { useState } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const [serverSettings, setServerSettings] = useState({
    serverName: 'RPG Master Server',
    port: 8080,
    maxPlayers: 8,
    autoSave: true,
    allowGuestPlayers: false,
  });

  const [gameSettings, setGameSettings] = useState({
    useVariantRules: false,
    allowMulticlassing: true,
    criticalHitRule: 'double-dice',
    restingRule: 'long-rest',
    encumbranceRule: 'none',
  });

  const [exportData, setExportData] = useState<string>('');

  const exportCampaign = async () => {
    try {
      const response = await fetch('/api/export');
      if (response.ok) {
        const data = await response.text();
        setExportData(data);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const importCampaign = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Campaign imported successfully!');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('nav.settings')}</h1>
        <p className="text-purple-200">Configure your RPG Master application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Settings */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Language Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Interface Language
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    language === 'es'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Español
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Server Settings */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Server Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={serverSettings.serverName}
                onChange={(e) => setServerSettings({ ...serverSettings, serverName: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Port
                </label>
                <input
                  type="number"
                  min="1000"
                  max="65535"
                  value={serverSettings.port}
                  onChange={(e) => setServerSettings({ ...serverSettings, port: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={serverSettings.maxPlayers}
                  onChange={(e) => setServerSettings({ ...serverSettings, maxPlayers: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Auto-save campaigns</span>
                <button
                  onClick={() => setServerSettings({ ...serverSettings, autoSave: !serverSettings.autoSave })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    serverSettings.autoSave ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      serverSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Allow guest players</span>
                <button
                  onClick={() => setServerSettings({ ...serverSettings, allowGuestPlayers: !serverSettings.allowGuestPlayers })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    serverSettings.allowGuestPlayers ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      serverSettings.allowGuestPlayers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rules Settings */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Game Rules</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Use variant rules</span>
              <button
                onClick={() => setGameSettings({ ...gameSettings, useVariantRules: !gameSettings.useVariantRules })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gameSettings.useVariantRules ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gameSettings.useVariantRules ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70">Allow multiclassing</span>
              <button
                onClick={() => setGameSettings({ ...gameSettings, allowMulticlassing: !gameSettings.allowMulticlassing })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gameSettings.allowMulticlassing ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gameSettings.allowMulticlassing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Critical Hit Rule
              </label>
              <select
                value={gameSettings.criticalHitRule}
                onChange={(e) => setGameSettings({ ...gameSettings, criticalHitRule: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="double-dice" className="bg-slate-800">Double dice</option>
                <option value="max-plus-roll" className="bg-slate-800">Max damage + roll</option>
                <option value="double-damage" className="bg-slate-800">Double total damage</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Resting Rules
              </label>
              <select
                value={gameSettings.restingRule}
                onChange={(e) => setGameSettings({ ...gameSettings, restingRule: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="long-rest" className="bg-slate-800">Standard (8 hours)</option>
                <option value="gritty-realism" className="bg-slate-800">Gritty realism (7 days)</option>
                <option value="epic-heroism" className="bg-slate-800">Epic heroism (1 hour)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Export Campaign</h3>
              <p className="text-white/60 text-sm mb-3">
                Export all campaign data to a JSON file for backup or sharing.
              </p>
              <button
                onClick={exportCampaign}
                className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg font-medium transition-colors"
              >
                <span className="material-icons text-sm mr-2">download</span>
                Export Campaign Data
              </button>
            </div>
            
            {exportData && (
              <div>
                <textarea
                  value={exportData}
                  readOnly
                  className="w-full h-32 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white text-sm font-mono resize-none"
                />
              </div>
            )}
            
            <div>
              <h3 className="text-white font-medium mb-2">Import Campaign</h3>
              <p className="text-white/60 text-sm mb-3">
                Import campaign data from a previously exported JSON file.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importCampaign(file);
                }}
                className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-medium transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-500/20 file:text-green-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Info */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Network Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-2">Server Status</h3>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Server Running</span>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Players can connect to your hotspot and join the game.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Connection Details</h3>
            <div className="space-y-1 text-sm">
              <p className="text-white/70">
                <span className="text-white">Server:</span> {serverSettings.serverName}
              </p>
              <p className="text-white/70">
                <span className="text-white">Port:</span> {serverSettings.port}
              </p>
              <p className="text-white/70">
                <span className="text-white">Max Players:</span> {serverSettings.maxPlayers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">About RPG Master</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-2">Version Information</h3>
            <div className="space-y-1 text-sm text-white/70">
              <p>Version: 1.0.0</p>
              <p>Build: 2025.08.31</p>
              <p>Platform: Web Application</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Legal</h3>
            <div className="space-y-1 text-sm text-white/70">
              <p>Licensed under OGL 1.0a</p>
              <p>Compatible with SRD 5.1/5.2 CC-BY-4.0</p>
              <p>Icons: Material Design Icons</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
