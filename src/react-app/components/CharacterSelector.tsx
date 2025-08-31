import { useState, useEffect } from 'react';
import { Character } from '@/shared/types';

interface CharacterSelectorProps {
  onSelectionChange: (selectedIds: number[]) => void;
  selectedCharacterIds: number[];
  showNPCs?: boolean;
  multiSelect?: boolean;
  title?: string;
}

export default function CharacterSelector({ 
  onSelectionChange, 
  selectedCharacterIds, 
  showNPCs = true,
  multiSelect = true,
  title = "Select Characters"
}: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'players' | 'npcs'>('all');

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

  const handleCharacterToggle = (characterId: number) => {
    if (multiSelect) {
      const newSelection = selectedCharacterIds.includes(characterId)
        ? selectedCharacterIds.filter(id => id !== characterId)
        : [...selectedCharacterIds, characterId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([characterId]);
    }
  };

  const filteredCharacters = characters.filter(char => {
    if (!showNPCs && char.is_npc) return false;
    if (filter === 'players') return !char.is_npc;
    if (filter === 'npcs') return char.is_npc;
    return true;
  });

  const selectAll = () => {
    const allIds = filteredCharacters.map(char => char.id);
    onSelectionChange(allIds);
  };

  const selectNone = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {multiSelect && (
          <div className="flex space-x-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
            >
              Select None
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {showNPCs && (
        <div className="flex space-x-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', icon: 'group' },
            { key: 'players', label: 'Players', icon: 'person' },
            { key: 'npcs', label: 'NPCs', icon: 'smart_toy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-all duration-200 ${
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
      )}

      {/* Character List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin text-purple-400">
            <span className="material-icons text-2xl">refresh</span>
          </div>
          <span className="ml-2 text-white">Loading characters...</span>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-icons text-4xl text-white/30 mb-2">group</span>
          <p className="text-white/60">No characters available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredCharacters.map((character) => {
            const isSelected = selectedCharacterIds.includes(character.id);
            
            return (
              <button
                key={character.id}
                onClick={() => handleCharacterToggle(character.id)}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                    : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                }`}
              >
                {multiSelect && (
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-purple-500 border-purple-500' 
                      : 'border-white/30'
                  }`}>
                    {isSelected && (
                      <span className="material-icons text-white text-xs">check</span>
                    )}
                  </div>
                )}
                
                <div className={`p-2 rounded-lg ${character.is_npc ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                  <span className={`material-icons ${character.is_npc ? 'text-orange-400' : 'text-blue-400'}`}>
                    {character.is_npc ? 'smart_toy' : 'person'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{character.name}</h4>
                  <p className="text-sm text-white/60">{character.character_class} • Level {character.level}</p>
                  {character.player_name && (
                    <p className="text-xs text-white/50">{character.player_name}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-white/70">{character.hit_points}/{character.max_hit_points} HP</p>
                  <p className="text-xs text-white/50">AC {character.armor_class}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {multiSelect && selectedCharacterIds.length > 0 && (
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-200 text-sm">
            {selectedCharacterIds.length} character{selectedCharacterIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
