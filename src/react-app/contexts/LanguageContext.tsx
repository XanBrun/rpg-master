import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/shared/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.characters': 'Characters',
    'nav.combat': 'Combat',
    'nav.shop': 'Shop',
    'nav.maps': 'Maps',
    'nav.travel': 'Travel',
    'nav.bestiary': 'Bestiary',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'RPG Master',
    'dashboard.subtitle': 'Local Multiplayer RPG Manager',
    'dashboard.campaigns': 'Active Campaigns',
    'dashboard.newCampaign': 'New Campaign',
    'dashboard.noCampaigns': 'No active campaigns',
    
    // Characters
    'characters.title': 'Characters',
    'characters.new': 'New Character',
    'characters.player': 'Player',
    'characters.npc': 'NPC',
    'characters.level': 'Level',
    'characters.hp': 'HP',
    'characters.ac': 'AC',
    'characters.gold': 'Gold',
    'characters.class': 'Class',
    'characters.name': 'Name',
    'characters.playerName': 'Player Name',
    'characters.experience': 'Experience',
    
    // Combat
    'combat.title': 'Combat',
    'combat.newEncounter': 'New Encounter',
    'combat.initiative': 'Initiative',
    'combat.turn': 'Turn',
    'combat.round': 'Round',
    'combat.currentHp': 'Current HP',
    'combat.actions': 'Actions',
    'combat.attack': 'Attack',
    'combat.defend': 'Defend',
    'combat.spell': 'Cast Spell',
    'combat.item': 'Use Item',
    'combat.endTurn': 'End Turn',
    
    // Shop
    'shop.title': 'Shop',
    'shop.weapons': 'Weapons',
    'shop.armor': 'Armor',
    'shop.items': 'Items',
    'shop.buy': 'Buy',
    'shop.sell': 'Sell',
    'shop.price': 'Price',
    'shop.weight': 'Weight',
    'shop.requiresLevel': 'Requires Level',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Stats
    'stats.strength': 'Strength',
    'stats.dexterity': 'Dexterity',
    'stats.constitution': 'Constitution',
    'stats.intelligence': 'Intelligence',
    'stats.wisdom': 'Wisdom',
    'stats.charisma': 'Charisma',
    
    // Session
    'session.gameMaster': 'Game Master',
    'session.player': 'Player',
    'session.logout': 'Logout',
    'session.switchRole': 'Switch Role',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.characters': 'Personajes',
    'nav.combat': 'Combate',
    'nav.shop': 'Tienda',
    'nav.maps': 'Mapas',
    'nav.travel': 'Viajes',
    'nav.bestiary': 'Bestiario',
    'nav.settings': 'Configuración',
    
    // Dashboard
    'dashboard.title': 'RPG Master',
    'dashboard.subtitle': 'Gestor RPG Multijugador Local',
    'dashboard.campaigns': 'Campañas Activas',
    'dashboard.newCampaign': 'Nueva Campaña',
    'dashboard.noCampaigns': 'No hay campañas activas',
    
    // Characters
    'characters.title': 'Personajes',
    'characters.new': 'Nuevo Personaje',
    'characters.player': 'Jugador',
    'characters.npc': 'PNJ',
    'characters.level': 'Nivel',
    'characters.hp': 'PV',
    'characters.ac': 'CA',
    'characters.gold': 'Oro',
    'characters.class': 'Clase',
    'characters.name': 'Nombre',
    'characters.playerName': 'Nombre del Jugador',
    'characters.experience': 'Experiencia',
    
    // Combat
    'combat.title': 'Combate',
    'combat.newEncounter': 'Nuevo Encuentro',
    'combat.initiative': 'Iniciativa',
    'combat.turn': 'Turno',
    'combat.round': 'Ronda',
    'combat.currentHp': 'PV Actuales',
    'combat.actions': 'Acciones',
    'combat.attack': 'Atacar',
    'combat.defend': 'Defender',
    'combat.spell': 'Lanzar Hechizo',
    'combat.item': 'Usar Objeto',
    'combat.endTurn': 'Terminar Turno',
    
    // Shop
    'shop.title': 'Tienda',
    'shop.weapons': 'Armas',
    'shop.armor': 'Armaduras',
    'shop.items': 'Objetos',
    'shop.buy': 'Comprar',
    'shop.sell': 'Vender',
    'shop.price': 'Precio',
    'shop.weight': 'Peso',
    'shop.requiresLevel': 'Requiere Nivel',
    
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
    'common.add': 'Añadir',
    'common.remove': 'Quitar',
    'common.confirm': 'Confirmar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    
    // Stats
    'stats.strength': 'Fuerza',
    'stats.dexterity': 'Destreza',
    'stats.constitution': 'Constitución',
    'stats.intelligence': 'Inteligencia',
    'stats.wisdom': 'Sabiduría',
    'stats.charisma': 'Carisma',
    
    // Session
    'session.gameMaster': 'Máster de Juego',
    'session.player': 'Jugador',
    'session.logout': 'Cerrar Sesión',
    'session.switchRole': 'Cambiar Rol',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('rpg-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('rpg-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
