import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';

interface Map {
  id: number;
  campaign_id: number;
  name: string;
  description?: string;
  image_url?: string;
  grid_size: number;
  scale_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MapMarker {
  id: number;
  map_id: number;
  x_position: number;
  y_position: number;
  marker_type: string;
  color: string;
  label?: string;
  description?: string;
  is_visible: boolean;
}

interface MapDrawing {
  id: number;
  map_id: number;
  drawing_type: string;
  path_data: string;
  color: string;
  stroke_width: number;
  is_visible: boolean;
}

type Tool = 'move' | 'marker' | 'draw' | 'erase' | 'measure';

export default function MapsPage() {
  const { t } = useLanguage();
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [drawings, setDrawings] = useState<MapDrawing[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>('move');
  const [showNewMap, setShowNewMap] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [gridVisible, setGridVisible] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMaps();
  }, []);

  useEffect(() => {
    if (selectedMap) {
      fetchMapData(selectedMap.id);
    }
  }, [selectedMap]);

  const fetchMaps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maps');
      if (response.ok) {
        const data = await response.json();
        setMaps(data);
      }
    } catch (error) {
      console.error('Failed to fetch maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMapData = async (mapId: number) => {
    try {
      const [markersRes, drawingsRes] = await Promise.all([
        fetch(`/api/maps/${mapId}/markers`),
        fetch(`/api/maps/${mapId}/drawings`)
      ]);
      
      if (markersRes.ok) {
        const markersData = await markersRes.json();
        setMarkers(markersData);
      }
      
      if (drawingsRes.ok) {
        const drawingsData = await drawingsRes.json();
        setDrawings(drawingsData);
      }
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createMap = async () => {
    if (!newMapName.trim()) return;

    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: 1, // Default campaign
          name: newMapName,
          description: newMapDescription,
          image_url: uploadedImage,
          grid_size: 40,
          scale_text: '1 square = 5 feet'
        }),
      });

      if (response.ok) {
        setShowNewMap(false);
        setNewMapName('');
        setNewMapDescription('');
        setUploadedImage(null);
        fetchMaps();
      }
    } catch (error) {
      console.error('Failed to create map:', error);
    }
  };

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedMap || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'marker') {
      const label = prompt('Enter marker label (optional):') || '';
      await addMarker(x, y, label);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'draw' && selectedMap) {
      setIsDrawing(true);
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setCurrentPath([{x, y}]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && activeTool === 'draw' && selectedMap) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setCurrentPath(prev => [...prev, {x, y}]);
    }
  };

  const handleMouseUp = async () => {
    if (isDrawing && activeTool === 'draw' && selectedMap && currentPath.length > 1) {
      await addDrawing(currentPath);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  const addMarker = async (x: number, y: number, label: string) => {
    if (!selectedMap) return;

    try {
      const response = await fetch(`/api/maps/${selectedMap.id}/markers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x_position: x,
          y_position: y,
          marker_type: 'pin',
          color: selectedColor,
          label: label
        }),
      });

      if (response.ok) {
        fetchMapData(selectedMap.id);
      }
    } catch (error) {
      console.error('Failed to add marker:', error);
    }
  };

  const addDrawing = async (path: {x: number, y: number}[]) => {
    if (!selectedMap) return;

    try {
      const pathData = path.map(p => `${p.x},${p.y}`).join(' ');
      const response = await fetch(`/api/maps/${selectedMap.id}/drawings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawing_type: 'path',
          path_data: pathData,
          color: selectedColor,
          stroke_width: strokeWidth
        }),
      });

      if (response.ok) {
        fetchMapData(selectedMap.id);
      }
    } catch (error) {
      console.error('Failed to add drawing:', error);
    }
  };

  const clearDrawings = async () => {
    if (!selectedMap || !confirm('Clear all drawings?')) return;

    try {
      await fetch(`/api/maps/${selectedMap.id}/drawings`, {
        method: 'DELETE'
      });
      fetchMapData(selectedMap.id);
    } catch (error) {
      console.error('Failed to clear drawings:', error);
    }
  };

  const tools = [
    { id: 'move', icon: 'pan_tool', label: 'Move', color: 'blue' },
    { id: 'marker', icon: 'place', label: 'Add Marker', color: 'green' },
    { id: 'draw', icon: 'brush', label: 'Draw', color: 'red' },
    { id: 'erase', icon: 'clear', label: 'Erase', color: 'orange' },
    { id: 'measure', icon: 'straighten', label: 'Measure', color: 'purple' },
  ];

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('nav.maps')}</h1>
          <p className="text-purple-200">Interactive maps for your campaigns</p>
        </div>
        <button
          onClick={() => setShowNewMap(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="material-icons">add</span>
          <span>New Map</span>
        </button>
      </div>

      {selectedMap ? (
        /* Map Viewer */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{selectedMap.name}</h2>
            <button
              onClick={() => setSelectedMap(null)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <span className="material-icons">arrow_back</span>
              <span>Back to Maps</span>
            </button>
          </div>

          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
            {/* Map Tools */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as Tool)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTool === tool.id
                      ? `bg-${tool.color}-500/20 text-${tool.color}-400 border border-${tool.color}-500/30`
                      : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <span className="material-icons text-sm">{tool.icon}</span>
                  <span className="text-sm">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Drawing Controls */}
            {(activeTool === 'draw' || activeTool === 'marker') && (
              <div className="flex items-center space-x-4 mb-4 p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-sm">Color:</span>
                  <div className="flex space-x-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded border-2 ${
                          selectedColor === color ? 'border-white' : 'border-white/30'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                {activeTool === 'draw' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-white/70 text-sm">Stroke:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-white text-sm">{strokeWidth}px</span>
                  </div>
                )}
                
                <button
                  onClick={() => setGridVisible(!gridVisible)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    gridVisible 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  Grid {gridVisible ? 'On' : 'Off'}
                </button>
                
                <button
                  onClick={clearDrawings}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Map Canvas */}
            <div 
              ref={mapContainerRef}
              className="relative bg-slate-900 rounded-lg overflow-hidden cursor-crosshair" 
              style={{ height: '600px' }}
            >
              {selectedMap.image_url ? (
                <img
                  src={selectedMap.image_url}
                  alt={selectedMap.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-icons text-4xl text-white/30 mb-2">map</span>
                    <p className="text-white/60">No map image uploaded</p>
                  </div>
                </div>
              )}
              
              {/* Grid Overlay */}
              {gridVisible && (
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width={selectedMap.grid_size} height={selectedMap.grid_size} patternUnits="userSpaceOnUse">
                        <path d={`M ${selectedMap.grid_size} 0 L 0 0 0 ${selectedMap.grid_size}`} fill="none" stroke="white" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}

              {/* Interactive Canvas */}
              <canvas
                ref={canvasRef}
                width={mapContainerRef.current?.offsetWidth || 800}
                height={mapContainerRef.current?.offsetHeight || 600}
                className="absolute inset-0 w-full h-full"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: activeTool === 'move' ? 'grab' : 'crosshair' }}
              />

              {/* Markers */}
              {markers.filter(m => m.is_visible).map((marker) => (
                <div
                  key={marker.id}
                  className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none"
                  style={{
                    left: `${marker.x_position}%`,
                    top: `${marker.y_position}%`,
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: marker.color }}
                  >
                    <span className="material-icons text-white text-xs">place</span>
                  </div>
                  {marker.label && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap">
                      {marker.label}
                    </div>
                  )}
                </div>
              ))}

              {/* Current drawing path */}
              {isDrawing && currentPath.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={`M ${currentPath.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
                    stroke={selectedColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                </svg>
              )}

              {/* Existing drawings */}
              {drawings.filter(d => d.is_visible).map((drawing) => (
                <svg key={drawing.id} className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={`M ${drawing.path_data.split(' ').join(' L ')}`}
                    stroke={drawing.color}
                    strokeWidth={drawing.stroke_width}
                    fill="none"
                  />
                </svg>
              ))}
            </div>

            {/* Map Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Markers</h4>
                <p className="text-white/60 text-sm">{markers.filter(m => m.is_visible).length} markers placed</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Drawings</h4>
                <p className="text-white/60 text-sm">{drawings.filter(d => d.is_visible).length} drawings created</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Scale</h4>
                <p className="text-white/60 text-sm">{selectedMap.scale_text}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Grid Size</h4>
                <p className="text-white/60 text-sm">{selectedMap.grid_size}px squares</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Maps Grid */
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Maps</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin text-purple-400">
                <span className="material-icons text-2xl">refresh</span>
              </div>
              <span className="ml-2 text-white">{t('common.loading')}</span>
            </div>
          ) : maps.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-white/30 mb-2">map</span>
              <p className="text-white/60">No maps created yet</p>
              <button
                onClick={() => setShowNewMap(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Create Your First Map
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/30 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedMap(map)}
                >
                  <div className="aspect-video bg-slate-900 rounded-lg mb-4 overflow-hidden">
                    {map.image_url ? (
                      <img
                        src={map.image_url}
                        alt={map.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons text-2xl text-white/30">map</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{map.name}</h3>
                  {map.description && (
                    <p className="text-white/70 text-sm mb-2">{map.description}</p>
                  )}
                  <div className="flex justify-between text-sm text-white/60">
                    <span>{map.scale_text}</span>
                    <span>{map.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Map Modal */}
      {showNewMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Create New Map</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Map Name
                </label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Enter map name"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  placeholder="Enter map description"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Map Image
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="max-w-full max-h-32 mx-auto rounded"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="material-icons text-2xl text-white/30 mb-2 block">cloud_upload</span>
                      <p className="text-white/60 text-sm mb-3">
                        Upload a map image or leave blank for a grid
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="map-upload"
                      />
                      <label
                        htmlFor="map-upload"
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg cursor-pointer inline-block transition-colors"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createMap}
                disabled={!newMapName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowNewMap(false);
                  setNewMapName('');
                  setNewMapDescription('');
                  setUploadedImage(null);
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
