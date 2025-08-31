import { useState, useEffect } from 'react';

interface TravelResult {
  days: number;
  totalRations: number;
  totalCost: number;
  details: {
    baseSpeed: number;
    terrainModifier: number;
    mountModifier: number;
    finalSpeed: number;
    partySize: number;
    mountCount: number;
  };
}

interface TravelHistory {
  id: number;
  destination: string;
  distance: number;
  terrain: string;
  mount: string;
  partySize: number;
  mountCount: number;
  result: TravelResult;
  timestamp: string;
}

export default function TravelCalculator() {
  const [distance, setDistance] = useState<number>(100);
  const [terrain, setTerrain] = useState<string>('normal');
  const [mount, setMount] = useState<string>('foot');
  const [partySize, setPartySize] = useState<number>(4);
  const [mountCount, setMountCount] = useState<number>(0);
  const [destination, setDestination] = useState<string>('');
  const [result, setResult] = useState<TravelResult | null>(null);
  const [history, setHistory] = useState<TravelHistory[]>([]);
  const [rationCost] = useState<number>(2); // GP per ration

  useEffect(() => {
    const savedHistory = localStorage.getItem('travel-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const terrainTypes = [
    { key: 'normal', label: 'Normal Road', modifier: 1.0, speed: 24 },
    { key: 'difficult', label: 'Difficult Terrain', modifier: 0.5, speed: 12 },
    { key: 'forest', label: 'Dense Forest', modifier: 0.75, speed: 18 },
    { key: 'mountain', label: 'Mountain Path', modifier: 0.5, speed: 12 },
    { key: 'swamp', label: 'Swampland', modifier: 0.25, speed: 6 },
    { key: 'desert', label: 'Desert', modifier: 0.75, speed: 18 },
    { key: 'highway', label: 'Royal Highway', modifier: 1.25, speed: 30 },
  ];

  const mountTypes = [
    { key: 'foot', label: 'On Foot', speed: 24, modifier: 1.0, cost: 0 },
    { key: 'horse', label: 'Horse', speed: 48, modifier: 2.0, cost: 5 },
    { key: 'pony', label: 'Pony', speed: 40, modifier: 1.67, cost: 3 },
    { key: 'mule', label: 'Mule', speed: 32, modifier: 1.33, cost: 2 },
    { key: 'camel', label: 'Camel', speed: 40, modifier: 1.67, cost: 4 },
    { key: 'wagon', label: 'Wagon', speed: 16, modifier: 0.67, cost: 1 },
  ];

  const calculateTravel = (): TravelResult => {
    const selectedTerrain = terrainTypes.find(t => t.key === terrain)!;
    const selectedMount = mountTypes.find(m => m.key === mount)!;
    
    const baseSpeed = selectedMount.speed;
    const terrainModifier = selectedTerrain.modifier;
    const mountModifier = selectedMount.modifier;
    const finalSpeed = baseSpeed * terrainModifier;
    
    const days = Math.ceil(distance / finalSpeed);
    const totalRations = days * (partySize + mountCount);
    const totalCost = totalRations * rationCost;
    
    return {
      days,
      totalRations,
      totalCost,
      details: {
        baseSpeed,
        terrainModifier,
        mountModifier,
        finalSpeed,
        partySize,
        mountCount,
      },
    };
  };

  const handleCalculate = () => {
    const travelResult = calculateTravel();
    setResult(travelResult);
    
    if (destination.trim()) {
      const newEntry: TravelHistory = {
        id: Date.now(),
        destination: destination.trim(),
        distance,
        terrain,
        mount,
        partySize,
        mountCount,
        result: travelResult,
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
      setHistory(updatedHistory);
      localStorage.setItem('travel-history', JSON.stringify(updatedHistory));
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('travel-history');
  };

  const loadFromHistory = (item: TravelHistory) => {
    setDestination(item.destination);
    setDistance(item.distance);
    setTerrain(item.terrain);
    setMount(item.mount);
    setPartySize(item.partySize);
    setMountCount(item.mountCount);
    setResult(item.result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Travel Calculator</h1>
          <p className="text-purple-200">Calculate travel time, rations, and costs for your journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Journey Details</h2>
          
          <div className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Destination (Optional)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                placeholder="Enter destination name"
              />
            </div>

            {/* Distance */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                min="1"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Terrain */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Terrain Type
              </label>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {terrainTypes.map((t) => (
                  <option key={t.key} value={t.key} className="bg-slate-800">
                    {t.label} ({t.speed} km/day)
                  </option>
                ))}
              </select>
            </div>

            {/* Mount Type */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Transportation
              </label>
              <select
                value={mount}
                onChange={(e) => setMount(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {mountTypes.map((m) => (
                  <option key={m.key} value={m.key} className="bg-slate-800">
                    {m.label} ({m.speed} km/day)
                  </option>
                ))}
              </select>
            </div>

            {/* Party Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Party Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Mounts/Animals
                </label>
                <input
                  type="number"
                  min="0"
                  value={mountCount}
                  onChange={(e) => setMountCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Calculate Journey
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Journey Results</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                  <span className="text-green-200">Travel Time</span>
                  <span className="text-white font-bold text-lg">{result.days} days</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                  <span className="text-green-200">Total Rations Needed</span>
                  <span className="text-white font-bold text-lg">{result.totalRations}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                  <span className="text-green-200">Total Cost</span>
                  <span className="text-yellow-400 font-bold text-lg">{result.totalCost} GP</span>
                </div>
                
                <div className="mt-6 pt-4 border-t border-green-500/30">
                  <h3 className="text-lg font-bold text-white mb-3">Calculation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-200">Base Speed:</span>
                      <span className="text-white">{result.details.baseSpeed} km/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-200">Terrain Modifier:</span>
                      <span className="text-white">{(result.details.terrainModifier * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-200">Effective Speed:</span>
                      <span className="text-white">{result.details.finalSpeed} km/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-200">Party + Mounts:</span>
                      <span className="text-white">{result.details.partySize + result.details.mountCount} total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Reference */}
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Reference</h3>
            
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h4 className="text-blue-400 font-medium mb-2">Rations</h4>
                <p className="text-white/70 text-sm">Each person and mount needs 1 ration per day</p>
                <p className="text-yellow-400 text-sm">Cost: {rationCost} GP per ration</p>
              </div>
              
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <h4 className="text-orange-400 font-medium mb-2">Terrain Effects</h4>
                <p className="text-white/70 text-sm">Difficult terrain reduces travel speed</p>
                <p className="text-white/70 text-sm">Royal highways increase speed</p>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <h4 className="text-purple-400 font-medium mb-2">Transportation</h4>
                <p className="text-white/70 text-sm">Mounts increase speed but need food</p>
                <p className="text-white/70 text-sm">Wagons are slow but carry supplies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Travel History */}
      {history.length > 0 && (
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Travel History</h2>
            <button
              onClick={clearHistory}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-sm transition-colors"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{item.destination || 'Unnamed Journey'}</h3>
                  <span className="text-white/60 text-sm">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Distance:</span>
                    <span className="text-white ml-1">{item.distance} km</span>
                  </div>
                  <div>
                    <span className="text-white/60">Time:</span>
                    <span className="text-white ml-1">{item.result.days} days</span>
                  </div>
                  <div>
                    <span className="text-white/60">Rations:</span>
                    <span className="text-white ml-1">{item.result.totalRations}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Cost:</span>
                    <span className="text-yellow-400 ml-1">{item.result.totalCost} GP</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
