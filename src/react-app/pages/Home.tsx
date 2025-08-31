import { useState, useEffect } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { Campaign } from '@/shared/types';

export default function HomePage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [masterName, setMasterName] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaignName.trim()) return;

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaignName,
          description: newCampaignDescription,
          master_name: masterName,
        }),
      });

      if (response.ok) {
        setShowNewCampaign(false);
        setNewCampaignName('');
        setNewCampaignDescription('');
        setMasterName('');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const activateCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/activate`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to activate campaign:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-purple-200">{t('dashboard.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowNewCampaign(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="material-icons">add</span>
          <span>{t('dashboard.newCampaign')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Active Campaigns</p>
              <p className="text-3xl font-bold text-white">{campaigns.filter(c => c.is_active).length}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <span className="material-icons text-purple-400 text-2xl">campaign</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Total Characters</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <span className="material-icons text-green-400 text-2xl">people</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">Active Combats</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <span className="material-icons text-orange-400 text-2xl">sports_kabaddi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.campaigns')}</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin text-purple-400">
              <span className="material-icons text-2xl">refresh</span>
            </div>
            <span className="ml-2 text-white">{t('common.loading')}</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons text-4xl text-white/30 mb-2">campaign</span>
            <p className="text-white/60">{t('dashboard.noCampaigns')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  campaign.is_active
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => !campaign.is_active && activateCampaign(campaign.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{campaign.name}</h3>
                  {campaign.is_active && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {campaign.description && (
                  <p className="text-white/70 text-sm mb-2">{campaign.description}</p>
                )}
                {campaign.master_name && (
                  <p className="text-purple-300 text-sm">Master: {campaign.master_name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">{t('dashboard.newCampaign')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newCampaignDescription}
                  onChange={(e) => setNewCampaignDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  placeholder="Enter campaign description"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Game Master
                </label>
                <input
                  type="text"
                  value={masterName}
                  onChange={(e) => setMasterName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Enter GM name"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createCampaign}
                disabled={!newCampaignName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowNewCampaign(false);
                  setNewCampaignName('');
                  setNewCampaignDescription('');
                  setMasterName('');
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
