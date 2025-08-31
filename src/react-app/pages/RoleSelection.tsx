import { useState } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';

interface RoleSelectionProps {
  onRoleSelected: (role: 'master' | 'player', playerName: string) => void;
}

export default function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
  const { language, setLanguage } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'master' | 'player' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleRoleSelect = (role: 'master' | 'player') => {
    setSelectedRole(role);
    setShowNameInput(true);
  };

  const handleContinue = () => {
    if (selectedRole && (selectedRole === 'master' || playerName.trim())) {
      onRoleSelected(selectedRole, playerName.trim());
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200"
      >
        <span className="material-icons">language</span>
        <span>{language === 'en' ? 'Español' : 'English'}</span>
      </button>

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <span className="material-icons text-white text-4xl">casino</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              {language === 'en' ? 'RPG Master' : 'RPG Master'}
            </h1>
            <p className="text-xl text-purple-200">
              {language === 'en' 
                ? 'Local Multiplayer RPG Manager' 
                : 'Gestor RPG Multijugador Local'}
            </p>
          </div>
          
          {!showNameInput ? (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {language === 'en' 
                  ? 'Select Your Role' 
                  : 'Selecciona tu Rol'}
              </h2>
              <p className="text-purple-200">
                {language === 'en'
                  ? 'Choose how you want to participate in the game'
                  : 'Elige cómo quieres participar en el juego'}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedRole === 'master' 
                  ? (language === 'en' ? 'Welcome, Game Master!' : '¡Bienvenido, Máster de Juego!')
                  : (language === 'en' ? 'Welcome, Player!' : '¡Bienvenido, Jugador!')}
              </h2>
              <p className="text-purple-200">
                {selectedRole === 'master'
                  ? (language === 'en' 
                      ? 'You will control the game world, NPCs, and encounters'
                      : 'Controlarás el mundo del juego, PNJs y encuentros')
                  : (language === 'en'
                      ? 'Enter your name to join the adventure'
                      : 'Ingresa tu nombre para unirte a la aventura')}
              </p>
            </div>
          )}
        </div>

        {!showNameInput ? (
          /* Role Selection Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Game Master Card */}
            <button
              onClick={() => handleRoleSelect('master')}
              className="group relative bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 backdrop-blur-md border border-red-500/30 hover:border-red-400 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="material-icons text-white text-3xl">shield</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {language === 'en' ? 'Game Master' : 'Máster de Juego'}
                </h3>
                <ul className="text-red-200 space-y-2 text-left">
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Create and manage campaigns' 
                        : 'Crear y gestionar campañas'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Control NPCs and enemies' 
                        : 'Controlar PNJs y enemigos'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Manage combat encounters' 
                        : 'Gestionar encuentros de combate'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Access bestiary and shop management' 
                        : 'Acceso a bestiario y gestión de tienda'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Draw on maps and place markers' 
                        : 'Dibujar en mapas y colocar marcadores'}
                    </span>
                  </li>
                </ul>
              </div>
            </button>

            {/* Player Card */}
            <button
              onClick={() => handleRoleSelect('player')}
              className="group relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-md border border-blue-500/30 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="material-icons text-white text-3xl">person</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {language === 'en' ? 'Player' : 'Jugador'}
                </h3>
                <ul className="text-blue-200 space-y-2 text-left">
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Create and manage characters' 
                        : 'Crear y gestionar personajes'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Participate in combat' 
                        : 'Participar en combate'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Buy and sell items' 
                        : 'Comprar y vender objetos'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'View maps and markers' 
                        : 'Ver mapas y marcadores'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="material-icons text-sm">check_circle</span>
                    <span>
                      {language === 'en' 
                        ? 'Plan travels and calculate resources' 
                        : 'Planificar viajes y calcular recursos'}
                    </span>
                  </li>
                </ul>
              </div>
            </button>
          </div>
        ) : (
          /* Name Input Form */
          <div className="max-w-md mx-auto">
            {selectedRole === 'player' && (
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="mb-6">
                  <label className="block text-white/70 text-lg font-medium mb-3">
                    {language === 'en' ? 'Your Name' : 'Tu Nombre'}
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white text-lg placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder={language === 'en' ? 'Enter your player name' : 'Ingresa tu nombre de jugador'}
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleContinue}
                    disabled={!playerName.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 text-lg"
                  >
                    {language === 'en' ? 'Continue' : 'Continuar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowNameInput(false);
                      setSelectedRole(null);
                      setPlayerName('');
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors text-lg"
                  >
                    {language === 'en' ? 'Back' : 'Atrás'}
                  </button>
                </div>
              </div>
            )}

            {selectedRole === 'master' && (
              <div className="text-center">
                <button
                  onClick={handleContinue}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 text-xl shadow-lg hover:shadow-xl"
                >
                  {language === 'en' ? 'Enter as Game Master' : 'Ingresar como Máster'}
                </button>
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setSelectedRole(null);
                  }}
                  className="block mx-auto mt-4 px-6 py-2 text-white/70 hover:text-white transition-colors"
                >
                  {language === 'en' ? 'Back to role selection' : 'Volver a selección de rol'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Features Preview */}
        {!showNameInput && (
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-8">
              {language === 'en' ? 'Key Features' : 'Características Principales'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <span className="material-icons text-purple-400 text-3xl mb-2">groups</span>
                <p className="text-white text-sm">
                  {language === 'en' ? 'Local Multiplayer' : 'Multijugador Local'}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <span className="material-icons text-green-400 text-3xl mb-2">sports_kabaddi</span>
                <p className="text-white text-sm">
                  {language === 'en' ? 'Turn-based Combat' : 'Combate por Turnos'}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <span className="material-icons text-blue-400 text-3xl mb-2">store</span>
                <p className="text-white text-sm">
                  {language === 'en' ? '300+ Items' : '300+ Objetos'}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <span className="material-icons text-orange-400 text-3xl mb-2">map</span>
                <p className="text-white text-sm">
                  {language === 'en' ? 'Interactive Maps' : 'Mapas Interactivos'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
