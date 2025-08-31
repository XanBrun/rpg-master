import { useState, useEffect } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { Item, Character, ITEM_TYPES } from '@/shared/types';

export default function ShopPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    item_type: 'Weapon' as const,
    price: 0,
    weight: 0,
    damage_dice: '',
    armor_bonus: 0,
    required_level: 1,
    is_magical: false,
  });

  useEffect(() => {
    fetchItems();
    fetchCharacters();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.filter((char: Character) => !char.is_npc));
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const createItem = async () => {
    if (!newItem.name.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setShowNewItem(false);
        setNewItem({
          name: '',
          description: '',
          item_type: 'Weapon',
          price: 0,
          weight: 0,
          damage_dice: '',
          armor_bonus: 0,
          required_level: 1,
          is_magical: false,
        });
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const buyItem = async (item: Item) => {
    if (!selectedCharacter) return;
    
    if (selectedCharacter.gold < item.price) {
      alert('Not enough gold!');
      return;
    }

    if (selectedCharacter.level < item.required_level) {
      alert(`Requires level ${item.required_level}!`);
      return;
    }

    try {
      const response = await fetch('/api/characters/buy-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: selectedCharacter.id,
          item_id: item.id,
        }),
      });

      if (response.ok) {
        fetchCharacters();
        alert('Item purchased successfully!');
      }
    } catch (error) {
      console.error('Failed to buy item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.item_type.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = [
    { key: 'all', label: 'All Items', icon: 'inventory' },
    { key: 'weapon', label: t('shop.weapons'), icon: 'sword' },
    { key: 'armor', label: t('shop.armor'), icon: 'shield' },
    { key: 'potion', label: 'Potions', icon: 'local_pharmacy' },
    { key: 'scroll', label: 'Scrolls', icon: 'description' },
    { key: 'tool', label: 'Tools', icon: 'construction' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('shop.title')}</h1>
          <p className="text-purple-200">Buy and sell items for your characters</p>
        </div>
        <button
          onClick={() => setShowNewItem(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="material-icons">add</span>
          <span>Add Item</span>
        </button>
      </div>

      {/* Character Selection */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Select Character</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {characters.map((character) => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacter(character)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                selectedCharacter?.id === character.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                  : 'bg-white/5 border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <span className="material-icons text-blue-400">person</span>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white text-sm">{character.name}</h4>
                  <p className="text-white/60 text-xs">{character.character_class}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 font-bold">{character.gold} gold</p>
                <p className="text-white/60 text-xs">Level {character.level}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === category.key
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            <span className="material-icons text-sm">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin text-purple-400">
              <span className="material-icons text-2xl">refresh</span>
            </div>
            <span className="ml-2 text-white">{t('common.loading')}</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons text-4xl text-white/30 mb-2">store</span>
            <p className="text-white/60">No items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border rounded-xl p-6 transition-all duration-200 ${
                  item.is_magical 
                    ? 'border-purple-500/30 shadow-purple-500/20 shadow-lg' 
                    : 'border-white/10 hover:border-purple-500/30'
                }`}
              >
                {/* Item Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      item.item_type === 'Weapon' ? 'bg-red-500/20' :
                      item.item_type === 'Armor' || item.item_type === 'Shield' ? 'bg-blue-500/20' :
                      item.item_type === 'Potion' ? 'bg-green-500/20' :
                      'bg-purple-500/20'
                    }`}>
                      <span className={`material-icons ${
                        item.item_type === 'Weapon' ? 'text-red-400' :
                        item.item_type === 'Armor' || item.item_type === 'Shield' ? 'text-blue-400' :
                        item.item_type === 'Potion' ? 'text-green-400' :
                        'text-purple-400'
                      }`}>
                        {item.item_type === 'Weapon' ? 'sword' :
                         item.item_type === 'Armor' || item.item_type === 'Shield' ? 'shield' :
                         item.item_type === 'Potion' ? 'local_pharmacy' :
                         'inventory'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-white/60">{item.item_type}</p>
                    </div>
                  </div>
                  {item.is_magical && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      Magical
                    </span>
                  )}
                </div>

                {/* Item Description */}
                {item.description && (
                  <p className="text-white/70 text-sm mb-4">{item.description}</p>
                )}

                {/* Item Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">{t('shop.price')}</span>
                    <span className="text-yellow-400 font-bold">{item.price} gp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">{t('shop.weight')}</span>
                    <span className="text-white">{item.weight} lbs</span>
                  </div>
                  {item.required_level > 1 && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">{t('shop.requiresLevel')}</span>
                      <span className="text-red-400">{item.required_level}</span>
                    </div>
                  )}
                  {item.damage_dice && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Damage</span>
                      <span className="text-red-400">{item.damage_dice}</span>
                    </div>
                  )}
                  {item.armor_bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">AC Bonus</span>
                      <span className="text-blue-400">+{item.armor_bonus}</span>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => buyItem(item)}
                  disabled={
                    !selectedCharacter || 
                    selectedCharacter.gold < item.price || 
                    selectedCharacter.level < item.required_level
                  }
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    !selectedCharacter 
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : selectedCharacter.gold < item.price
                      ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                      : selectedCharacter.level < item.required_level
                      ? 'bg-orange-500/20 text-orange-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  }`}
                >
                  {!selectedCharacter 
                    ? 'Select Character'
                    : selectedCharacter.gold < item.price
                    ? 'Not Enough Gold'
                    : selectedCharacter.level < item.required_level
                    ? 'Level Too Low'
                    : t('shop.buy')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Item Modal */}
      {showNewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Add New Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  placeholder="Enter item description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Type</label>
                  <select
                    value={newItem.item_type}
                    onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {ITEM_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-slate-800">{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Price (GP)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.weight}
                    onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Required Level</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newItem.required_level}
                    onChange={(e) => setNewItem({ ...newItem, required_level: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {newItem.item_type === 'Weapon' && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Damage Dice</label>
                  <input
                    type="text"
                    value={newItem.damage_dice}
                    onChange={(e) => setNewItem({ ...newItem, damage_dice: e.target.value })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 1d8"
                  />
                </div>
              )}

              {['Armor', 'Shield'].includes(newItem.item_type) && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">AC Bonus</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.armor_bonus}
                    onChange={(e) => setNewItem({ ...newItem, armor_bonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_magical"
                  checked={newItem.is_magical}
                  onChange={(e) => setNewItem({ ...newItem, is_magical: e.target.checked })}
                  className="rounded border-white/20 bg-black/20 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="is_magical" className="text-white/70 text-sm font-medium">
                  Magical Item
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createItem}
                disabled={!newItem.name.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowNewItem(false)}
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
