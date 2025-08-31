import { useState, useEffect } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { Character, CHARACTER_CLASSES } from '@/shared/types';

export default function CharactersPage() {
  const { t } = useLanguage();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCharacter, setShowNewCharacter] = useState(false);
  const [filter, setFilter] = useState<'all' | 'players' | 'npcs'>('all');
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    player_name: '',
    character_class: 'Fighter' as const,
    level: 1,
    hit_points: 10,
    max_hit_points: 10,
    armor_class: 10,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    gold: 0,
    is_npc: false,
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCharacter = async () => {
    if (!newCharacter.name.trim()) return;

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCharacter,
          campaign_id: 1, // Default campaign for now
        }),
      });

      if (response.ok) {
        setShowNewCharacter(false);
        setNewCharacter({
          name: '',
          player_name: '',
          character_class: 'Fighter',
          level: 1,
          hit_points: 10,
          max_hit_points: 10,
          armor_class: 10,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          gold: 0,
          is_npc: false,
        });
        fetchCharacters();
      }
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const filteredCharacters = characters.filter(char => {
    if (filter === 'players') return !char.is_npc;
    if (filter === 'npcs') return char.is_npc;
    return true;
  });

  const getStatModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('characters.title')}</h1>
          <p className="text-purple-200">Manage player characters and NPCs</p>
        </div>
        <button
          onClick={() => setShowNewCharacter(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="material-icons">person_add</span>
          <span>{t('characters.new')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-1">
        {[
          { key: 'all', label: 'All Characters', icon: 'group' },
          { key: 'players', label: t('characters.player'), icon: 'person' },
          { key: 'npcs', label: t('characters.npc'), icon: 'smart_toy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              filter === tab.key
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-icons text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Characters Grid */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin text-purple-400">
              <span className="material-icons text-2xl">refresh</span>
            </div>
            <span className="ml-2 text-white">{t('common.loading')}</span>
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons text-4xl text-white/30 mb-2">group</span>
            <p className="text-white/60">No characters found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-200"
              >
                {/* Character Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${character.is_npc ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                      <span className={`material-icons ${character.is_npc ? 'text-orange-400' : 'text-blue-400'}`}>
                        {character.is_npc ? 'smart_toy' : 'person'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{character.name}</h3>
                      {character.player_name && (
                        <p className="text-sm text-white/60">{character.player_name}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    character.is_npc 
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {character.is_npc ? t('characters.npc') : t('characters.player')}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-white/60 text-sm">{t('characters.class')}</p>
                    <p className="text-white font-medium">{character.character_class}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm">{t('characters.level')}</p>
                    <p className="text-white font-medium">{character.level}</p>
                  </div>
                </div>

                {/* Health & AC */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-white/60 text-xs">{t('characters.hp')}</p>
                    <p className="text-red-400 font-bold">{character.hit_points}/{character.max_hit_points}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs">{t('characters.ac')}</p>
                    <p className="text-blue-400 font-bold">{character.armor_class}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs">{t('characters.gold')}</p>
                    <p className="text-yellow-400 font-bold">{character.gold}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-white/60">STR</p>
                    <p className="text-white font-medium">
                      {character.strength} ({formatModifier(getStatModifier(character.strength))})
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">DEX</p>
                    <p className="text-white font-medium">
                      {character.dexterity} ({formatModifier(getStatModifier(character.dexterity))})
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">CON</p>
                    <p className="text-white font-medium">
                      {character.constitution} ({formatModifier(getStatModifier(character.constitution))})
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">INT</p>
                    <p className="text-white font-medium">
                      {character.intelligence} ({formatModifier(getStatModifier(character.intelligence))})
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">WIS</p>
                    <p className="text-white font-medium">
                      {character.wisdom} ({formatModifier(getStatModifier(character.wisdom))})
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">CHA</p>
                    <p className="text-white font-medium">
                      {character.charisma} ({formatModifier(getStatModifier(character.charisma))})
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4 pt-4 border-t border-white/10">
                  <button className="flex-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm font-medium transition-colors">
                    {t('common.edit')}
                  </button>
                  <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm font-medium transition-colors">
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Character Modal */}
      {showNewCharacter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">{t('characters.new')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('characters.name')}
                  </label>
                  <input
                    type="text"
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="Enter character name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('characters.playerName')}
                  </label>
                  <input
                    type="text"
                    value={newCharacter.player_name}
                    onChange={(e) => setNewCharacter({ ...newCharacter, player_name: e.target.value })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="Enter player name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('characters.class')}
                  </label>
                  <select
                    value={newCharacter.character_class}
                    onChange={(e) => setNewCharacter({ ...newCharacter, character_class: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {CHARACTER_CLASSES.map((cls) => (
                      <option key={cls} value={cls} className="bg-slate-800">{cls}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_npc"
                    checked={newCharacter.is_npc}
                    onChange={(e) => setNewCharacter({ ...newCharacter, is_npc: e.target.checked })}
                    className="rounded border-white/20 bg-black/20 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="is_npc" className="text-white/70 text-sm font-medium">
                    {t('characters.npc')}
                  </label>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      {t('characters.level')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newCharacter.level}
                      onChange={(e) => setNewCharacter({ ...newCharacter, level: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      {t('characters.hp')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newCharacter.hit_points}
                      onChange={(e) => {
                        const hp = parseInt(e.target.value) || 1;
                        setNewCharacter({ 
                          ...newCharacter, 
                          hit_points: hp,
                          max_hit_points: Math.max(hp, newCharacter.max_hit_points)
                        });
                      }}
                      className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'strength', label: 'STR' },
                    { key: 'dexterity', label: 'DEX' },
                    { key: 'constitution', label: 'CON' },
                    { key: 'intelligence', label: 'INT' },
                    { key: 'wisdom', label: 'WIS' },
                    { key: 'charisma', label: 'CHA' },
                  ].map((stat) => (
                    <div key={stat.key}>
                      <label className="block text-white/70 text-xs font-medium mb-1">
                        {stat.label}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={newCharacter[stat.key as keyof typeof newCharacter] as number}
                        onChange={(e) => setNewCharacter({ 
                          ...newCharacter, 
                          [stat.key]: parseInt(e.target.value) || 10 
                        })}
                        className="w-full px-2 py-1 bg-black/20 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createCharacter}
                disabled={!newCharacter.name.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowNewCharacter(false)}
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
