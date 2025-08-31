import { useState } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';

interface CombatActionsProps {
  currentParticipant: any;
  allParticipants: any[];
  onAction: (action: string, target?: any, details?: any) => void;
}

export default function CombatActions({ currentParticipant, allParticipants, onAction }: CombatActionsProps) {
  const { t } = useLanguage();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [damageAmount, setDamageAmount] = useState(0);
  const [healAmount, setHealAmount] = useState(0);
  const [condition, setCondition] = useState('');

  const handleAttack = () => {
    if (!selectedTarget) {
      alert('Select a target first!');
      return;
    }

    const damage = Math.floor(Math.random() * 8) + 1; // 1d8 damage
    onAction('attack', selectedTarget, { damage });
    setSelectedAction(null);
    setSelectedTarget(null);
  };

  const handleDamage = () => {
    if (!selectedTarget || damageAmount <= 0) {
      alert('Select a target and enter damage amount!');
      return;
    }

    onAction('damage', selectedTarget, { damage: damageAmount });
    setDamageAmount(0);
    setSelectedAction(null);
    setSelectedTarget(null);
  };

  const handleHeal = () => {
    if (!selectedTarget || healAmount <= 0) {
      alert('Select a target and enter heal amount!');
      return;
    }

    onAction('heal', selectedTarget, { heal: healAmount });
    setHealAmount(0);
    setSelectedAction(null);
    setSelectedTarget(null);
  };

  const handleCondition = () => {
    if (!selectedTarget || !condition.trim()) {
      alert('Select a target and enter condition!');
      return;
    }

    onAction('condition', selectedTarget, { condition });
    setCondition('');
    setSelectedAction(null);
    setSelectedTarget(null);
  };

  const actions = [
    { 
      id: 'attack', 
      icon: 'swords', 
      label: t('combat.attack'), 
      color: 'red',
      description: 'Roll for attack damage'
    },
    { 
      id: 'damage', 
      icon: 'favorite_border', 
      label: 'Apply Damage', 
      color: 'red',
      description: 'Apply specific damage amount'
    },
    { 
      id: 'heal', 
      icon: 'healing', 
      label: 'Heal', 
      color: 'green',
      description: 'Restore hit points'
    },
    { 
      id: 'defend', 
      icon: 'shield', 
      label: t('combat.defend'), 
      color: 'blue',
      description: 'Defensive action (+2 AC until next turn)'
    },
    { 
      id: 'spell', 
      icon: 'auto_fix_high', 
      label: t('combat.spell'), 
      color: 'purple',
      description: 'Cast a spell or magical ability'
    },
    { 
      id: 'item', 
      icon: 'inventory', 
      label: t('combat.item'), 
      color: 'orange',
      description: 'Use an item from inventory'
    },
    { 
      id: 'condition', 
      icon: 'psychology', 
      label: 'Apply Condition', 
      color: 'yellow',
      description: 'Apply status effect (poisoned, stunned, etc.)'
    },
    { 
      id: 'other', 
      icon: 'more_horiz', 
      label: 'Other Action', 
      color: 'gray',
      description: 'Custom action or ability'
    },
  ];

  const potentialTargets = allParticipants.filter(p => p.character.id !== currentParticipant.character.id);

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {currentParticipant.character.name}'s Turn
      </h3>
      
      {!selectedAction ? (
        /* Action Selection */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={`flex flex-col items-center space-y-3 p-4 bg-${action.color}-500/20 hover:bg-${action.color}-500/30 border border-${action.color}-500/30 text-${action.color}-400 rounded-lg transition-all duration-200 group`}
            >
              <span className="material-icons text-2xl">{action.icon}</span>
              <div className="text-center">
                <span className="font-medium block">{action.label}</span>
                <span className="text-xs text-white/60 group-hover:text-white/80">
                  {action.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Action Details */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              {actions.find(a => a.id === selectedAction)?.label}
            </h4>
            <button
              onClick={() => {
                setSelectedAction(null);
                setSelectedTarget(null);
                setDamageAmount(0);
                setHealAmount(0);
                setCondition('');
              }}
              className="text-white/60 hover:text-white"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Target Selection (for most actions) */}
          {['attack', 'damage', 'heal', 'condition'].includes(selectedAction) && (
            <div>
              <h5 className="text-white font-medium mb-3">Select Target:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {potentialTargets.map((participant) => (
                  <button
                    key={participant.id}
                    onClick={() => setSelectedTarget(participant)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                      selectedTarget?.id === participant.id
                        ? 'bg-purple-500/20 border-purple-500/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-purple-500/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      participant.character.is_npc ? 'bg-orange-500/20' : 'bg-blue-500/20'
                    }`}>
                      <span className={`material-icons text-sm ${
                        participant.character.is_npc ? 'text-orange-400' : 'text-blue-400'
                      }`}>
                        {participant.character.is_npc ? 'smart_toy' : 'person'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{participant.character.name}</p>
                      <p className="text-sm text-white/60">
                        {participant.current_hp}/{participant.character.max_hit_points} HP
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action-specific inputs */}
          {selectedAction === 'damage' && (
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Damage Amount
              </label>
              <input
                type="number"
                min="1"
                value={damageAmount}
                onChange={(e) => setDamageAmount(parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="0"
              />
            </div>
          )}

          {selectedAction === 'heal' && (
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Heal Amount
              </label>
              <input
                type="number"
                min="1"
                value={healAmount}
                onChange={(e) => setHealAmount(parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="0"
              />
            </div>
          )}

          {selectedAction === 'condition' && (
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Condition/Effect
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full max-w-xs px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="" className="bg-slate-800">Select condition...</option>
                <option value="Poisoned" className="bg-slate-800">Poisoned</option>
                <option value="Stunned" className="bg-slate-800">Stunned</option>
                <option value="Paralyzed" className="bg-slate-800">Paralyzed</option>
                <option value="Frightened" className="bg-slate-800">Frightened</option>
                <option value="Charmed" className="bg-slate-800">Charmed</option>
                <option value="Blinded" className="bg-slate-800">Blinded</option>
                <option value="Deafened" className="bg-slate-800">Deafened</option>
                <option value="Unconscious" className="bg-slate-800">Unconscious</option>
                <option value="Concentration" className="bg-slate-800">Concentrating</option>
                <option value="Blessed" className="bg-slate-800">Blessed</option>
                <option value="Hasted" className="bg-slate-800">Hasted</option>
                <option value="Shield" className="bg-slate-800">Shield (+5 AC)</option>
              </select>
            </div>
          )}

          {/* Execute Action */}
          <div className="flex space-x-3">
            {selectedAction === 'attack' && (
              <button
                onClick={handleAttack}
                disabled={!selectedTarget}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Roll Attack
              </button>
            )}
            
            {selectedAction === 'damage' && (
              <button
                onClick={handleDamage}
                disabled={!selectedTarget || damageAmount <= 0}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Apply Damage
              </button>
            )}
            
            {selectedAction === 'heal' && (
              <button
                onClick={handleHeal}
                disabled={!selectedTarget || healAmount <= 0}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Apply Healing
              </button>
            )}
            
            {selectedAction === 'condition' && (
              <button
                onClick={handleCondition}
                disabled={!selectedTarget || !condition.trim()}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Apply Condition
              </button>
            )}
            
            {selectedAction === 'defend' && (
              <button
                onClick={() => {
                  onAction('defend', currentParticipant, { defense: true });
                  setSelectedAction(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Take Defensive Stance
              </button>
            )}
            
            {selectedAction === 'spell' && (
              <button
                onClick={() => {
                  const spellName = prompt('Enter spell/ability name:') || 'Unknown Spell';
                  onAction('spell', null, { spell: spellName });
                  setSelectedAction(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Cast Spell
              </button>
            )}
            
            {selectedAction === 'item' && (
              <button
                onClick={() => {
                  const itemName = prompt('Enter item name:') || 'Unknown Item';
                  onAction('item', null, { item: itemName });
                  setSelectedAction(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Use Item
              </button>
            )}
            
            {selectedAction === 'other' && (
              <button
                onClick={() => {
                  const actionName = prompt('Describe the action:') || 'Custom Action';
                  onAction('other', null, { action: actionName });
                  setSelectedAction(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Perform Action
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
