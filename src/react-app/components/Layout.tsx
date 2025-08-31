import { ReactNode } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { useSession } from '@/react-app/contexts/SessionContext';
import { Link, useLocation } from 'react-router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { session, isGameMaster, isPlayer, logout } = useSession();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'dashboard', label: t('nav.dashboard') },
    { path: '/characters', icon: 'people', label: t('nav.characters') },
    { path: '/combat', icon: 'sports_kabaddi', label: t('nav.combat') },
    { path: '/shop', icon: 'store', label: t('nav.shop') },
    { path: '/maps', icon: 'map', label: t('nav.maps') },
    { path: '/travel', icon: 'directions_walk', label: t('nav.travel') },
    ...(isGameMaster ? [{ path: '/bestiary', icon: 'pets', label: t('nav.bestiary') }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <span className="material-icons text-white text-xl">shield</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('dashboard.title')}</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-purple-200">
                  {isGameMaster ? t('session.gameMaster') : t('session.player')}
                </p>
                {isPlayer && session?.playerName && (
                  <>
                    <span className="text-purple-200">•</span>
                    <p className="text-blue-300 text-sm">{session.playerName}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
            >
              <span className="material-icons text-sm">language</span>
              <span className="text-sm">{language.toUpperCase()}</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
            >
              <span className="material-icons text-sm">logout</span>
              <span className="text-sm">{t('session.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-black/20 backdrop-blur-md border-r border-white/10 min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="material-icons text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
