import z from "zod";

// Campaign types
export const CampaignSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  master_name: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Character types
export const CharacterSchema = z.object({
  id: z.number(),
  campaign_id: z.number(),
  name: z.string(),
  player_name: z.string().optional(),
  character_class: z.string(),
  level: z.number(),
  experience: z.number(),
  hit_points: z.number(),
  max_hit_points: z.number(),
  armor_class: z.number(),
  strength: z.number(),
  dexterity: z.number(),
  constitution: z.number(),
  intelligence: z.number(),
  wisdom: z.number(),
  charisma: z.number(),
  gold: z.number(),
  is_npc: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Character = z.infer<typeof CharacterSchema>;

// Item types
export const ItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  item_type: z.string(),
  price: z.number(),
  weight: z.number(),
  damage_dice: z.string().optional(),
  armor_bonus: z.number(),
  required_level: z.number(),
  is_magical: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Item = z.infer<typeof ItemSchema>;

// Character Item types
export const CharacterItemSchema = z.object({
  id: z.number(),
  character_id: z.number(),
  item_id: z.number(),
  quantity: z.number(),
  is_equipped: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CharacterItem = z.infer<typeof CharacterItemSchema>;

// Combat types
export const CombatEncounterSchema = z.object({
  id: z.number(),
  campaign_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  is_active: z.boolean(),
  current_turn: z.number(),
  round_number: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CombatEncounter = z.infer<typeof CombatEncounterSchema>;

export const CombatParticipantSchema = z.object({
  id: z.number(),
  encounter_id: z.number(),
  character_id: z.number(),
  initiative: z.number(),
  turn_order: z.number(),
  current_hp: z.number(),
  is_active: z.boolean(),
  conditions: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CombatParticipant = z.infer<typeof CombatParticipantSchema>;

// API request/response types
export const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  master_name: z.string().optional(),
});

export const CreateCharacterSchema = z.object({
  campaign_id: z.number(),
  name: z.string().min(1),
  player_name: z.string().optional(),
  character_class: z.string().min(1),
  level: z.number().min(1).max(20),
  hit_points: z.number().min(1),
  max_hit_points: z.number().min(1),
  armor_class: z.number().min(1),
  strength: z.number().min(1).max(30),
  dexterity: z.number().min(1).max(30),
  constitution: z.number().min(1).max(30),
  intelligence: z.number().min(1).max(30),
  wisdom: z.number().min(1).max(30),
  charisma: z.number().min(1).max(30),
  gold: z.number().min(0),
  is_npc: z.boolean(),
});

export const CreateItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  item_type: z.string().min(1),
  price: z.number().min(0),
  weight: z.number().min(0),
  damage_dice: z.string().optional(),
  armor_bonus: z.number().min(0),
  required_level: z.number().min(1).max(20),
  is_magical: z.boolean(),
});

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
export type CreateCharacter = z.infer<typeof CreateCharacterSchema>;
export type CreateItem = z.infer<typeof CreateItemSchema>;

// Language types
export type Language = 'en' | 'es';

// User session types
export type UserRole = 'master' | 'player';

export interface UserSession {
  role: UserRole;
  playerName?: string;
  sessionId?: string;
}

// Travel calculation types
export interface TravelResult {
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

// Character classes
export const CHARACTER_CLASSES = [
  'Fighter',
  'Rogue',
  'Wizard',
  'Cleric',
  'Ranger',
  'Paladin',
  'Barbarian',
  'Bard',
  'Druid',
  'Monk',
  'Sorcerer',
  'Warlock'
] as const;

export type CharacterClass = typeof CHARACTER_CLASSES[number];

// Item types
export const ITEM_TYPES = [
  'Weapon',
  'Armor',
  'Shield',
  'Potion',
  'Scroll',
  'Tool',
  'Adventuring Gear',
  'Food',
  'Treasure'
] as const;

export type ItemType = typeof ITEM_TYPES[number];
