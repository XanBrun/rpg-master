import { useState, useEffect } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { CombatEncounter, CombatParticipant, Character } from '@/shared/types';
import CombatActions from '@/react-app/components/CombatActions';
import CharacterSelector from '@/react-app/components/CharacterSelector';

export default function CombatPage() {
  const { t } = useLanguage();
  const [encounters, setEncounters] = useState<CombatEncounter[]>([]);
  const [activeEncounter, setActiveEncounter] = useState<CombatEncounter | null>(null);
  const [participants, setParticipants] = useState<(CombatParticipant & { character: Character })[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewEncounter, setShowNewEncounter] = useState(false);
  const [newEncounterName, setNewEncounterName] = useState('');
  const [newEncounterDescription, setNewEncounterDescription] = useState('');
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([]);

  useEffect(() => {
    fetchEncounters();
  }, []);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/combat-encounters');
      if (response.ok) {
        const data = await response.json();
        setEncounters(data);
        
        // Load active encounter if any
        const active = data.find((e: CombatEncounter) => e.is_active);
        if (active) {
          setActiveEncounter(active);
          fetchParticipants(active.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch encounters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (encounterId: number) => {
    try {
      const response = await fetch(`/api/combat-encounters/${encounterId}/participants`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  const createEncounter = async () => {
    if (!newEncounterName.trim()) return;

    try {
      const response = await fetch('/api/combat-encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: 1, // Default campaign
          name: newEncounterName,
          description: newEncounterDescription,
        }),
      });

      if (response.ok) {
        setShowNewEncounter(false);
        setNewEncounterName('');
        setNewEncounterDescription('');
        fetchEncounters();
      }
    } catch (error) {
      console.error('Failed to create encounter:', error);
    }
  };

  const startEncounter = async (encounter: CombatEncounter) => {
    try {
      const response = await fetch(`/api/combat-encounters/${encounter.id}/start`, {
        method: 'PUT',
      });

      if (response.ok) {
        setActiveEncounter(encounter);
        fetchEncounters();
        fetchParticipants(encounter.id);
      }
    } catch (error) {
      console.error('Failed to start encounter:', error);
    }
  };

  const endEncounter = async () => {
    if (!activeEncounter) return;

    try {
      const response = await fetch(`/api/combat-encounters/${activeEncounter.id}/end`, {
        method: 'PUT',
      });

      if (response.ok) {
        setActiveEncounter(null);
        setParticipants([]);
        fetchEncounters();
      }
    } catch (error) {
      console.error('Failed to end encounter:', error);
    }
  };

  const nextTurn = async () => {
    if (!activeEncounter) return;

    try {
      const response = await fetch(`/api/combat-encounters/${activeEncounter.id}/next-turn`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedEncounter = await response.json();
        setActiveEncounter(updatedEncounter);
        fetchParticipants(activeEncounter.id);
      }
    } catch (error) {
      console.error('Failed to advance turn:', error);
    }
  };

  const addParticipants = async () => {
    if (!activeEncounter || selectedCharacterIds.length === 0) return;

    try {
      const response = await fetch(`/api/combat-encounters/${activeEncounter.id}/add-participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterIds: selectedCharacterIds }),
      });

      if (response.ok) {
        setShowAddParticipants(false);
        setSelectedCharacterIds([]);
        fetchParticipants(activeEncounter.id);
      }
    } catch (error) {
      console.error('Failed to add participants:', error);
    }
  };

  const handleCombatAction = async (action: string, target?: any, details?: any) => {
    if (!activeEncounter || !currentParticipant) return;

    try {
      await fetch(`/api/combat-encounters/${activeEncounter.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          participantId: currentParticipant.id,
          targetId: target?.id,
          details,
        }),
      });

      // Refresh participants to show updated HP/conditions
      fetchParticipants(activeEncounter.id);
      
      // Auto-advance turn for some actions
      if (['attack', 'defend', 'spell', 'item', 'other'].includes(action)) {
        setTimeout(() => nextTurn(), 1000);
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const updateParticipantHP = async (participantId: number, newHP: number) => {
    try {
      await fetch(`/api/combat-participants/${participantId}/hp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_hp: newHP }),
      });
      fetchParticipants(activeEncounter!.id);
    } catch (error) {
      console.error('Failed to update HP:', error);
    }
  };

  const removeCondition = async (participantId: number, conditionToRemove: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    const currentConditions = participant.conditions || '';
    const conditions = currentConditions.split(', ').filter(c => c.trim() && c !== conditionToRemove);
    const newConditions = conditions.join(', ');

    try {
      await fetch(`/api/combat-participants/${participantId}/conditions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions: newConditions }),
      });
      fetchParticipants(activeEncounter!.id);
    } catch (error) {
      console.error('Failed to update conditions:', error);
    }
  };

  

  const sortedParticipants = [...participants].sort((a, b) => 
    b.initiative - a.initiative || b.turn_order - a.turn_order
  );

  const currentParticipant = sortedParticipants[activeEncounter?.current_turn || 0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('combat.title')}</h1>
          <p className="text-purple-200">Manage combat encounters and initiative</p>
        </div>
        <div className="flex space-x-3">
          {activeEncounter && (
            <>
              <button
                onClick={() => setShowAddParticipants(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-medium transition-colors"
              >
                <span className="material-icons">person_add</span>
                <span>Add Characters</span>
              </button>
              <button
                onClick={endEncounter}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors"
              >
                <span className="material-icons">stop</span>
                <span>End Combat</span>
              </button>
            </>
          )}
          <button
            onClick={() => setShowNewEncounter(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="material-icons">add</span>
            <span>{t('combat.newEncounter')}</span>
          </button>
        </div>
      </div>

      {activeEncounter ? (
        <div className="space-y-6">
          {/* Active Combat Header */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{activeEncounter.name}</h2>
                <p className="text-orange-200">{activeEncounter.description}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-200 text-sm">
                  {t('combat.round')} {activeEncounter.round_number}
                </p>
                <p className="text-white text-lg font-bold">
                  {t('combat.turn')}: {(activeEncounter.current_turn || 0) + 1}
                </p>
              </div>
            </div>
          </div>

          {/* Initiative Tracker */}
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Initiative Order</h3>
              <button
                onClick={nextTurn}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-medium transition-colors"
              >
                <span className="material-icons">skip_next</span>
                <span>{t('combat.endTurn')}</span>
              </button>
            </div>

            <div className="space-y-3">
              {sortedParticipants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    index === (activeEncounter.current_turn || 0)
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === (activeEncounter.current_turn || 0)
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/20 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        participant.character.is_npc ? 'bg-orange-500/20' : 'bg-blue-500/20'
                      }`}>
                        <span className={`material-icons ${
                          participant.character.is_npc ? 'text-orange-400' : 'text-blue-400'
                        }`}>
                          {participant.character.is_npc ? 'smart_toy' : 'person'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{participant.character.name}</h4>
                        <p className="text-sm text-white/60">{participant.character.character_class}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-white/60 text-xs">{t('combat.initiative')}</p>
                      <p className="text-white font-bold">{participant.initiative}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xs">{t('combat.currentHp')}</p>
                      <p className={`font-bold ${
                        participant.current_hp <= participant.character.max_hit_points * 0.25
                          ? 'text-red-400'
                          : participant.current_hp <= participant.character.max_hit_points * 0.5
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}>
                        {participant.current_hp}/{participant.character.max_hit_points}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xs">AC</p>
                      <p className="text-blue-400 font-bold">{participant.character.armor_class}</p>
                    </div>
                    
                    {/* HP Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateParticipantHP(participant.id, Math.max(0, participant.current_hp - 1))}
                        className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          const newHP = prompt('Enter new HP:', participant.current_hp.toString());
                          if (newHP !== null) {
                            const hp = Math.max(0, Math.min(participant.character.max_hit_points, parseInt(newHP) || 0));
                            updateParticipantHP(participant.id, hp);
                          }
                        }}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => updateParticipantHP(participant.id, Math.min(participant.character.max_hit_points, participant.current_hp + 1))}
                        className="w-6 h-6 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Conditions */}
                  {participant.conditions && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-white/60 text-xs mb-1">Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {participant.conditions.split(', ').map((condition: string, idx: number) => (
                          condition.trim() && (
                            <button
                              key={idx}
                              onClick={() => removeCondition(participant.id, condition)}
                              className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors"
                              title="Click to remove"
                            >
                              {condition} ✕
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Combat Actions */}
          {currentParticipant && (
            <CombatActions
              currentParticipant={currentParticipant}
              allParticipants={sortedParticipants}
              onAction={handleCombatAction}
            />
          )}
        </div>
      ) : (
        /* Encounter List */
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Available Encounters</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin text-purple-400">
                <span className="material-icons text-2xl">refresh</span>
              </div>
              <span className="ml-2 text-white">{t('common.loading')}</span>
            </div>
          ) : encounters.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-white/30 mb-2">sports_kabaddi</span>
              <p className="text-white/60">No encounters created</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {encounters.map((encounter) => (
                <div
                  key={encounter.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/30 transition-all duration-200"
                >
                  <h3 className="font-semibold text-white mb-2">{encounter.name}</h3>
                  {encounter.description && (
                    <p className="text-white/70 text-sm mb-4">{encounter.description}</p>
                  )}
                  <button
                    onClick={() => startEncounter(encounter)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Start Combat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Encounter Modal */}
      {showNewEncounter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">{t('combat.newEncounter')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Encounter Name
                </label>
                <input
                  type="text"
                  value={newEncounterName}
                  onChange={(e) => setNewEncounterName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Enter encounter name"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newEncounterDescription}
                  onChange={(e) => setNewEncounterDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  placeholder="Enter encounter description"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createEncounter}
                disabled={!newEncounterName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowNewEncounter(false);
                  setNewEncounterName('');
                  setNewEncounterDescription('');
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participants Modal */}
      {showAddParticipants && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6">Add Characters to Combat</h3>
            
            <CharacterSelector
              onSelectionChange={setSelectedCharacterIds}
              selectedCharacterIds={selectedCharacterIds}
              showNPCs={true}
              multiSelect={true}
              title="Select characters to add to combat"
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addParticipants}
                disabled={selectedCharacterIds.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Add to Combat ({selectedCharacterIds.length})
              </button>
              <button
                onClick={() => {
                  setShowAddParticipants(false);
                  setSelectedCharacterIds([]);
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
