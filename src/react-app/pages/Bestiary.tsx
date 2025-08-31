import { useState, useEffect } from 'react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { CreateCharacter } from '@/shared/types';

interface BestiaryEntry {
  id: number;
  name: string;
  challenge_rating: string;
  armor_class: number;
  hit_points: number;
  speed: string;
  size: string;
  type: string;
  alignment: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  condition_immunities?: string;
  senses?: string;
  languages?: string;
  special_abilities?: string[];
  actions?: string[];
  description: string;
}

export default function Bestiary() {
  const { t } = useLanguage();
  const [bestiary, setBestiary] = useState<BestiaryEntry[]>([]);
  const [filteredBestiary, setFilteredBestiary] = useState<BestiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCR, setSelectedCR] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<BestiaryEntry | null>(null);

  useEffect(() => {
    generateBestiary();
  }, []);

  useEffect(() => {
    filterBestiary();
  }, [bestiary, searchTerm, selectedType, selectedCR]);

  const generateBestiary = () => {
    // Generate 50 pre-defined NPCs/monsters
    const entries: BestiaryEntry[] = [
      // Humanoids (CR 1/8 - 5)
      {
        id: 1, name: 'Goblin Warrior', challenge_rating: '1/4', armor_class: 15, hit_points: 7,
        speed: '30 ft', size: 'Small', type: 'humanoid', alignment: 'neutral evil',
        stats: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
        actions: ['Scimitar: +4 to hit, 1d6+2 slashing damage', 'Shortbow: +4 to hit, 1d6+2 piercing damage'],
        description: 'Small, cruel humanoids that attack in groups.'
      },
      {
        id: 2, name: 'Orc Berserker', challenge_rating: '1', armor_class: 13, hit_points: 15,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'chaotic evil',
        stats: { strength: 16, dexterity: 12, constitution: 16, intelligence: 7, wisdom: 11, charisma: 10 },
        actions: ['Greataxe: +5 to hit, 1d12+3 slashing damage', 'Rage: Advantage on Strength checks and saves'],
        description: 'Fierce warriors driven by battle fury.'
      },
      {
        id: 3, name: 'Human Bandit', challenge_rating: '1/8', armor_class: 12, hit_points: 11,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'any non-lawful',
        stats: { strength: 11, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 10, charisma: 10 },
        actions: ['Scimitar: +3 to hit, 1d6+1 slashing damage', 'Light Crossbow: +3 to hit, 1d8+1 piercing damage'],
        description: 'Common criminals and highway robbers.'
      },
      {
        id: 4, name: 'Hobgoblin Captain', challenge_rating: '3', armor_class: 17, hit_points: 39,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'lawful evil',
        stats: { strength: 15, dexterity: 14, constitution: 14, intelligence: 12, wisdom: 10, charisma: 13 },
        actions: ['Greatsword: +4 to hit, 2d6+2 slashing damage', 'Leadership: Allies gain +1 to attack rolls'],
        description: 'Disciplined military leaders of goblinoid forces.'
      },
      {
        id: 5, name: 'Drow Assassin', challenge_rating: '4', armor_class: 15, hit_points: 52,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'neutral evil',
        stats: { strength: 10, dexterity: 16, constitution: 14, intelligence: 13, wisdom: 13, charisma: 12 },
        actions: ['Shortsword: +6 to hit, 1d6+3 piercing + poison', 'Hand Crossbow: +6 to hit, 1d6+3 piercing + poison'],
        special_abilities: ['Fey Ancestry', 'Sunlight Sensitivity', 'Sneak Attack'],
        description: 'Deadly dark elf assassins from the Underdark.'
      },

      // Beasts (CR 1/8 - 3)
      {
        id: 6, name: 'Wolf', challenge_rating: '1/4', armor_class: 13, hit_points: 11,
        speed: '40 ft', size: 'Medium', type: 'beast', alignment: 'unaligned',
        stats: { strength: 12, dexterity: 15, constitution: 12, intelligence: 3, wisdom: 12, charisma: 6 },
        actions: ['Bite: +4 to hit, 2d4+2 piercing damage, target must save or be knocked prone'],
        special_abilities: ['Pack Tactics', 'Keen Hearing and Smell'],
        description: 'Cunning pack hunters of the wilderness.'
      },
      {
        id: 7, name: 'Brown Bear', challenge_rating: '1', armor_class: 11, hit_points: 34,
        speed: '40 ft, climb 30 ft', size: 'Large', type: 'beast', alignment: 'unaligned',
        stats: { strength: 19, dexterity: 10, constitution: 16, intelligence: 2, wisdom: 13, charisma: 7 },
        actions: ['Bite: +6 to hit, 1d8+4 piercing damage', 'Claw: +6 to hit, 2d6+4 slashing damage'],
        special_abilities: ['Keen Smell'],
        description: 'Powerful omnivores that defend their territory fiercely.'
      },
      {
        id: 8, name: 'Giant Spider', challenge_rating: '1', armor_class: 14, hit_points: 26,
        speed: '30 ft, climb 30 ft', size: 'Large', type: 'beast', alignment: 'unaligned',
        stats: { strength: 14, dexterity: 16, constitution: 12, intelligence: 2, wisdom: 11, charisma: 4 },
        actions: ['Bite: +5 to hit, 1d8+3 piercing + poison save or paralyzed'],
        special_abilities: ['Spider Climb', 'Web Sense'],
        description: 'Massive arachnids that hunt from their webs.'
      },
      {
        id: 9, name: 'Dire Wolf', challenge_rating: '1', armor_class: 14, hit_points: 37,
        speed: '50 ft', size: 'Large', type: 'beast', alignment: 'unaligned',
        stats: { strength: 17, dexterity: 15, constitution: 15, intelligence: 3, wisdom: 12, charisma: 7 },
        actions: ['Bite: +5 to hit, 2d6+3 piercing damage, target must save or be knocked prone'],
        special_abilities: ['Pack Tactics', 'Keen Hearing and Smell'],
        description: 'Enormous wolves with supernatural cunning.'
      },
      {
        id: 10, name: 'Owlbear', challenge_rating: '3', armor_class: 13, hit_points: 59,
        speed: '40 ft', size: 'Large', type: 'monstrosity', alignment: 'unaligned',
        stats: { strength: 20, dexterity: 12, constitution: 17, intelligence: 3, wisdom: 12, charisma: 7 },
        actions: ['Beak: +7 to hit, 1d10+5 piercing damage', 'Claws: +7 to hit, 2d8+5 slashing damage'],
        special_abilities: ['Keen Sight and Smell'],
        description: 'Ferocious hybrid creature with the body of a bear and head of an owl.'
      },

      // Undead (CR 1/4 - 5)
      {
        id: 11, name: 'Skeleton Warrior', challenge_rating: '1/4', armor_class: 13, hit_points: 13,
        speed: '30 ft', size: 'Medium', type: 'undead', alignment: 'lawful evil',
        stats: { strength: 10, dexterity: 14, constitution: 15, intelligence: 6, wisdom: 8, charisma: 5 },
        actions: ['Shortsword: +4 to hit, 1d6+2 piercing damage', 'Shortbow: +4 to hit, 1d6+2 piercing damage'],
        damage_immunities: 'poison', condition_immunities: 'exhaustion, poisoned',
        description: 'Animated remains of fallen warriors.'
      },
      {
        id: 12, name: 'Zombie', challenge_rating: '1/4', armor_class: 8, hit_points: 22,
        speed: '20 ft', size: 'Medium', type: 'undead', alignment: 'neutral evil',
        stats: { strength: 13, dexterity: 6, constitution: 16, intelligence: 3, wisdom: 6, charisma: 5 },
        actions: ['Slam: +3 to hit, 1d6+1 bludgeoning damage'],
        special_abilities: ['Undead Fortitude'],
        damage_immunities: 'poison', condition_immunities: 'poisoned',
        description: 'Shambling corpses animated by dark magic.'
      },
      {
        id: 13, name: 'Ghoul', challenge_rating: '1', armor_class: 12, hit_points: 22,
        speed: '30 ft', size: 'Medium', type: 'undead', alignment: 'chaotic evil',
        stats: { strength: 13, dexterity: 15, constitution: 10, intelligence: 7, wisdom: 10, charisma: 6 },
        actions: ['Bite: +2 to hit, 2d6+2 piercing damage', 'Claws: +4 to hit, 2d4+2 slashing + paralysis'],
        damage_immunities: 'poison', condition_immunities: 'charmed, exhaustion, poisoned',
        description: 'Flesh-eating undead that paralyze their victims.'
      },
      {
        id: 14, name: 'Wight', challenge_rating: '3', armor_class: 14, hit_points: 45,
        speed: '30 ft', size: 'Medium', type: 'undead', alignment: 'neutral evil',
        stats: { strength: 15, dexterity: 14, constitution: 16, intelligence: 10, wisdom: 13, charisma: 15 },
        actions: ['Life Drain: +4 to hit, 1d6+2 necrotic + life drain', 'Longsword: +4 to hit, 1d8+2 slashing'],
        damage_resistances: 'necrotic, bludgeoning/piercing/slashing from nonmagical attacks',
        description: 'Malevolent spirits that drain the life force of the living.'
      },
      {
        id: 15, name: 'Wraith', challenge_rating: '5', armor_class: 13, hit_points: 67,
        speed: '0 ft, fly 60 ft (hover)', size: 'Medium', type: 'undead', alignment: 'neutral evil',
        stats: { strength: 6, dexterity: 16, constitution: 16, intelligence: 12, wisdom: 14, charisma: 15 },
        actions: ['Life Drain: +6 to hit, 4d8+3 necrotic + life drain'],
        damage_resistances: 'acid, cold, fire, lightning, thunder',
        damage_immunities: 'necrotic, poison',
        special_abilities: ['Incorporeal Movement', 'Sunlight Sensitivity'],
        description: 'Incorporeal undead born from souls consumed by evil.'
      },

      // Dragons (CR 2-8)
      {
        id: 16, name: 'Young White Dragon', challenge_rating: '6', armor_class: 17, hit_points: 133,
        speed: '40 ft, burrow 20 ft, fly 80 ft, swim 40 ft', size: 'Large', type: 'dragon', alignment: 'chaotic evil',
        stats: { strength: 18, dexterity: 10, constitution: 18, intelligence: 6, wisdom: 11, charisma: 12 },
        actions: ['Bite: +7 to hit, 2d10+4 piercing + cold', 'Cold Breath: 30-foot cone, 8d8 cold damage'],
        damage_immunities: 'cold',
        special_abilities: ['Ice Walk', 'Legendary Actions'],
        description: 'Cruel and predatory dragons that breathe freezing cold.'
      },
      {
        id: 17, name: 'Pseudodragon', challenge_rating: '1/4', armor_class: 13, hit_points: 7,
        speed: '15 ft, fly 60 ft', size: 'Tiny', type: 'dragon', alignment: 'neutral good',
        stats: { strength: 6, dexterity: 15, constitution: 13, intelligence: 10, wisdom: 12, charisma: 10 },
        actions: ['Bite: +4 to hit, 1d4+2 piercing damage', 'Sting: +4 to hit, 1d4+2 piercing + poison'],
        special_abilities: ['Keen Senses', 'Magic Resistance', 'Limited Telepathy'],
        description: 'Miniature dragons that serve as familiars to spellcasters.'
      },
      {
        id: 18, name: 'Wyvern', challenge_rating: '6', armor_class: 13, hit_points: 110,
        speed: '20 ft, fly 80 ft', size: 'Large', type: 'dragon', alignment: 'unaligned',
        stats: { strength: 19, dexterity: 10, constitution: 16, intelligence: 5, wisdom: 12, charisma: 6 },
        actions: ['Bite: +7 to hit, 2d6+4 piercing damage', 'Stinger: +7 to hit, 2d6+4 piercing + poison'],
        skills: 'Perception +4',
        description: 'Two-legged dragons with venomous stingers.'
      },

      // Elementals (CR 1-5)
      {
        id: 19, name: 'Fire Elemental', challenge_rating: '5', armor_class: 13, hit_points: 102,
        speed: '50 ft', size: 'Large', type: 'elemental', alignment: 'neutral',
        stats: { strength: 10, dexterity: 17, constitution: 16, intelligence: 6, wisdom: 10, charisma: 7 },
        actions: ['Touch: +6 to hit, 2d6+3 fire damage + ignite'],
        damage_resistances: 'bludgeoning, piercing, and slashing from nonmagical attacks',
        damage_immunities: 'fire, poison',
        special_abilities: ['Fire Form', 'Illumination', 'Water Susceptibility'],
        description: 'Living flames that burn everything they touch.'
      },
      {
        id: 20, name: 'Water Elemental', challenge_rating: '5', armor_class: 14, hit_points: 114,
        speed: '30 ft, swim 90 ft', size: 'Large', type: 'elemental', alignment: 'neutral',
        stats: { strength: 18, dexterity: 14, constitution: 18, intelligence: 5, wisdom: 10, charisma: 8 },
        actions: ['Slam: +7 to hit, 2d8+4 bludgeoning damage', 'Whelm: Engulf creature in water'],
        damage_resistances: 'acid; bludgeoning, piercing, and slashing from nonmagical attacks',
        special_abilities: ['Water Form', 'Freeze'],
        description: 'Flowing water given sentience and purpose.'
      },

      // Fiends (CR 1-6)
      {
        id: 21, name: 'Imp', challenge_rating: '1', armor_class: 13, hit_points: 10,
        speed: '20 ft, fly 40 ft', size: 'Tiny', type: 'fiend', alignment: 'lawful evil',
        stats: { strength: 6, dexterity: 17, constitution: 13, intelligence: 11, wisdom: 12, charisma: 14 },
        actions: ['Sting: +5 to hit, 1d4+3 piercing + poison', 'Invisibility: Turn invisible at will'],
        damage_resistances: 'cold; bludgeoning, piercing, and slashing from nonmagical attacks',
        damage_immunities: 'fire, poison',
        description: 'Mischievous devils that serve as familiars.'
      },
      {
        id: 22, name: 'Succubus', challenge_rating: '4', armor_class: 15, hit_points: 66,
        speed: '30 ft, fly 60 ft', size: 'Medium', type: 'fiend', alignment: 'neutral evil',
        stats: { strength: 8, dexterity: 17, constitution: 13, intelligence: 15, wisdom: 12, charisma: 20 },
        actions: ['Claw: +5 to hit, 1d6+3 slashing damage', 'Charm: Target must save or be charmed'],
        damage_resistances: 'cold, fire, lightning, poison; bludgeoning, piercing, and slashing from nonmagical attacks',
        special_abilities: ['Telepathic Bond', 'Shapechange'],
        description: 'Seductive demons that corrupt souls through temptation.'
      },

      // Fey (CR 1/4-4)
      {
        id: 23, name: 'Dryad', challenge_rating: '1', armor_class: 11, hit_points: 22,
        speed: '30 ft', size: 'Medium', type: 'fey', alignment: 'neutral',
        stats: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 15, charisma: 18 },
        actions: ['Club: +2 to hit, 1d4 bludgeoning damage', 'Fey Charm: Charm humanoids'],
        special_abilities: ['Innate Spellcasting', 'Magic Resistance', 'Tree Stride'],
        description: 'Nature spirits bound to specific trees.'
      },
      {
        id: 24, name: 'Pixie', challenge_rating: '1/4', armor_class: 15, hit_points: 1,
        speed: '10 ft, fly 30 ft', size: 'Tiny', type: 'fey', alignment: 'neutral good',
        stats: { strength: 2, dexterity: 20, constitution: 8, intelligence: 10, wisdom: 14, charisma: 15 },
        actions: ['Superior Invisibility', 'Confusion (1/Day)', 'Polymorph (1/Day)'],
        special_abilities: ['Innate Spellcasting', 'Magic Resistance'],
        description: 'Tiny fey creatures with powerful magical abilities.'
      },

      // Giants (CR 5-9)
      {
        id: 25, name: 'Hill Giant', challenge_rating: '5', armor_class: 13, hit_points: 105,
        speed: '40 ft', size: 'Huge', type: 'giant', alignment: 'chaotic evil',
        stats: { strength: 21, dexterity: 8, constitution: 19, intelligence: 5, wisdom: 9, charisma: 6 },
        actions: ['Greatclub: +8 to hit, 3d8+5 bludgeoning damage', 'Rock: +8 to hit, 3d10+5 bludgeoning damage'],
        skills: 'Perception +2',
        description: 'Brutish giants that dwell in hills and raid settlements.'
      },
      {
        id: 26, name: 'Stone Giant', challenge_rating: '7', armor_class: 17, hit_points: 126,
        speed: '40 ft', size: 'Huge', type: 'giant', alignment: 'neutral',
        stats: { strength: 23, dexterity: 15, constitution: 20, intelligence: 10, wisdom: 12, charisma: 9 },
        actions: ['Greatclub: +9 to hit, 3d8+6 bludgeoning damage', 'Rock: +9 to hit, 4d10+6 bludgeoning damage'],
        special_abilities: ['Stone Camouflage'],
        description: 'Reclusive giants that blend with rocky terrain.'
      },

      // Monstrosities (CR 1-6)
      {
        id: 27, name: 'Manticore', challenge_rating: '3', armor_class: 14, hit_points: 68,
        speed: '30 ft, fly 50 ft', size: 'Large', type: 'monstrosity', alignment: 'lawful evil',
        stats: { strength: 17, dexterity: 16, constitution: 17, intelligence: 7, wisdom: 12, charisma: 8 },
        actions: ['Bite: +5 to hit, 1d8+3 piercing damage', 'Claw: +5 to hit, 1d6+3 slashing damage', 'Tail Spike: +5 to hit, 1d8+3 piercing damage'],
        special_abilities: ['Tail Spike Regrowth'],
        description: 'Monsters with human heads, lion bodies, and spiked tails.'
      },
      {
        id: 28, name: 'Griffon', challenge_rating: '2', armor_class: 12, hit_points: 59,
        speed: '30 ft, fly 80 ft', size: 'Large', type: 'monstrosity', alignment: 'unaligned',
        stats: { strength: 18, dexterity: 15, constitution: 16, intelligence: 2, wisdom: 13, charisma: 8 },
        actions: ['Beak: +6 to hit, 1d8+4 piercing damage', 'Claws: +6 to hit, 2d6+4 slashing damage'],
        special_abilities: ['Keen Sight'],
        description: 'Majestic creatures with eagle heads and lion bodies.'
      },
      {
        id: 29, name: 'Chimera', challenge_rating: '6', armor_class: 14, hit_points: 114,
        speed: '30 ft, fly 60 ft', size: 'Large', type: 'monstrosity', alignment: 'chaotic evil',
        stats: { strength: 19, dexterity: 11, constitution: 19, intelligence: 3, wisdom: 14, charisma: 10 },
        actions: ['Bite: +7 to hit, 2d6+4 piercing damage', 'Horns: +7 to hit, 1d12+4 bludgeoning damage', 'Fire Breath: 15-foot cone, 7d8 fire damage'],
        description: 'Three-headed monsters with lion, goat, and dragon heads.'
      },

      // Constructs (CR 1-6)
      {
        id: 30, name: 'Animated Armor', challenge_rating: '1', armor_class: 18, hit_points: 33,
        speed: '25 ft', size: 'Medium', type: 'construct', alignment: 'unaligned',
        stats: { strength: 14, dexterity: 11, constitution: 13, intelligence: 1, wisdom: 3, charisma: 1 },
        actions: ['Slam: +4 to hit, 1d6+2 bludgeoning damage'],
        damage_immunities: 'poison, psychic',
        condition_immunities: 'blinded, charmed, deafened, exhaustion, frightened, paralyzed, petrified, poisoned',
        description: 'Suits of armor animated by magic to serve as guardians.'
      },
      {
        id: 31, name: 'Stone Golem', challenge_rating: '10', armor_class: 17, hit_points: 178,
        speed: '30 ft', size: 'Large', type: 'construct', alignment: 'unaligned',
        stats: { strength: 22, dexterity: 9, constitution: 20, intelligence: 3, wisdom: 11, charisma: 1 },
        actions: ['Slam: +10 to hit, 3d8+6 bludgeoning damage', 'Slow Spell (Recharge 5-6)'],
        damage_immunities: 'poison, psychic; bludgeoning, piercing, and slashing from nonmagical attacks',
        special_abilities: ['Immutable Form', 'Magic Resistance'],
        description: 'Massive constructs carved from stone and animated by powerful magic.'
      },

      // Additional Humanoids
      {
        id: 32, name: 'Cult Fanatic', challenge_rating: '2', armor_class: 13, hit_points: 33,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'any non-good',
        stats: { strength: 11, dexterity: 14, constitution: 12, intelligence: 10, wisdom: 13, charisma: 14 },
        actions: ['Dagger: +4 to hit, 1d4+2 piercing damage', 'Spellcasting: 4th-level spellcaster'],
        special_abilities: ['Dark Devotion', 'Spellcasting'],
        description: 'Zealous followers of dark powers with spellcasting abilities.'
      },
      {
        id: 33, name: 'Knight', challenge_rating: '3', armor_class: 18, hit_points: 52,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'any alignment',
        stats: { strength: 16, dexterity: 11, constitution: 14, intelligence: 11, wisdom: 11, charisma: 15 },
        actions: ['Greatsword: +5 to hit, 2d6+3 slashing damage', 'Heavy Crossbow: +2 to hit, 1d10+1 piercing damage'],
        special_abilities: ['Brave', 'Leadership'],
        description: 'Armored warriors sworn to a code of honor.'
      },
      {
        id: 34, name: 'Assassin', challenge_rating: '8', armor_class: 15, hit_points: 78,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'any non-good',
        stats: { strength: 11, dexterity: 16, constitution: 14, intelligence: 13, wisdom: 11, charisma: 10 },
        actions: ['Shortsword: +6 to hit, 1d6+3 piercing + poison', 'Light Crossbow: +6 to hit, 1d8+3 piercing + poison'],
        special_abilities: ['Assassinate', 'Sneak Attack', 'Evasion'],
        description: 'Professional killers who strike from the shadows.'
      },

      // More Beasts
      {
        id: 35, name: 'Saber-toothed Tiger', challenge_rating: '2', armor_class: 12, hit_points: 52,
        speed: '40 ft', size: 'Large', type: 'beast', alignment: 'unaligned',
        stats: { strength: 18, dexterity: 14, constitution: 15, intelligence: 3, wisdom: 12, charisma: 8 },
        actions: ['Bite: +6 to hit, 1d10+4 piercing damage', 'Claw: +6 to hit, 2d6+4 slashing damage'],
        special_abilities: ['Keen Smell', 'Pounce'],
        description: 'Prehistoric cats with massive fangs.'
      },
      {
        id: 36, name: 'Giant Eagle', challenge_rating: '1', armor_class: 13, hit_points: 26,
        speed: '10 ft, fly 80 ft', size: 'Large', type: 'beast', alignment: 'neutral good',
        stats: { strength: 16, dexterity: 17, constitution: 13, intelligence: 8, wisdom: 14, charisma: 10 },
        actions: ['Beak: +5 to hit, 1d6+3 piercing damage', 'Talons: +5 to hit, 2d6+3 slashing damage'],
        special_abilities: ['Keen Sight'],
        description: 'Noble birds of prey with human-level intelligence.'
      },

      // More Undead
      {
        id: 37, name: 'Banshee', challenge_rating: '4', armor_class: 12, hit_points: 58,
        speed: '0 ft, fly 40 ft (hover)', size: 'Medium', type: 'undead', alignment: 'chaotic evil',
        stats: { strength: 1, dexterity: 14, constitution: 10, intelligence: 12, wisdom: 11, charisma: 17 },
        actions: ['Corrupting Touch: +4 to hit, 3d6+2 necrotic damage', 'Wail (1/Day): All creatures within 30 ft must save or drop to 0 hit points'],
        damage_resistances: 'acid, fire, lightning, thunder',
        damage_immunities: 'cold, necrotic, poison',
        special_abilities: ['Incorporeal Movement', 'Detect Life'],
        description: 'The vengeful spirits of elves who died in anguish.'
      },
      {
        id: 38, name: 'Lich', challenge_rating: '21', armor_class: 17, hit_points: 135,
        speed: '30 ft', size: 'Medium', type: 'undead', alignment: 'any evil',
        stats: { strength: 11, dexterity: 16, constitution: 16, intelligence: 20, wisdom: 14, charisma: 16 },
        actions: ['Paralyzing Touch: +12 to hit, 3d6 cold + paralysis', 'Spellcasting: 18th-level spellcaster'],
        damage_resistances: 'cold, lightning, necrotic',
        damage_immunities: 'poison; bludgeoning, piercing, and slashing from nonmagical attacks',
        special_abilities: ['Legendary Actions', 'Legendary Resistance', 'Rejuvenation'],
        description: 'Powerful undead spellcasters who achieved immortality through dark magic.'
      },

      // Additional Fiends
      {
        id: 39, name: 'Demon (Quasit)', challenge_rating: '1', armor_class: 13, hit_points: 7,
        speed: '40 ft', size: 'Tiny', type: 'fiend', alignment: 'chaotic evil',
        stats: { strength: 5, dexterity: 17, constitution: 10, intelligence: 7, wisdom: 10, charisma: 10 },
        actions: ['Claws: +4 to hit, 1d4+3 slashing + poison', 'Scare (1/Day)', 'Invisibility (At Will)'],
        damage_resistances: 'cold, fire, lightning',
        damage_immunities: 'poison',
        special_abilities: ['Shapechanger', 'Magic Resistance'],
        description: 'Weak demons that serve as familiars and spies.'
      },
      {
        id: 40, name: 'Balor', challenge_rating: '19', armor_class: 19, hit_points: 262,
        speed: '40 ft, fly 80 ft', size: 'Huge', type: 'fiend', alignment: 'chaotic evil',
        stats: { strength: 26, dexterity: 15, constitution: 22, intelligence: 20, wisdom: 16, charisma: 22 },
        actions: ['Longsword: +14 to hit, 2d8+8 slashing + 3d8 fire', 'Whip: +14 to hit, 2d6+8 slashing + 3d6 fire + pull'],
        damage_resistances: 'cold, lightning',
        damage_immunities: 'fire, poison',
        special_abilities: ['Death Throes', 'Fire Aura', 'Magic Resistance'],
        description: 'Powerful demon lords wreathed in flame and shadow.'
      },

      // More Fey
      {
        id: 41, name: 'Satyr', challenge_rating: '1/2', armor_class: 14, hit_points: 31,
        speed: '40 ft', size: 'Medium', type: 'fey', alignment: 'chaotic neutral',
        stats: { strength: 12, dexterity: 16, constitution: 11, intelligence: 12, wisdom: 10, charisma: 14 },
        actions: ['Ram: +3 to hit, 2d4+1 bludgeoning damage', 'Shortbow: +5 to hit, 1d6+3 piercing damage'],
        special_abilities: ['Magic Resistance'],
        description: 'Goat-legged fey creatures known for their love of music and revelry.'
      },

      // Additional Monstrosities
      {
        id: 42, name: 'Minotaur', challenge_rating: '3', armor_class: 14, hit_points: 76,
        speed: '40 ft', size: 'Large', type: 'monstrosity', alignment: 'chaotic evil',
        stats: { strength: 18, dexterity: 11, constitution: 16, intelligence: 6, wisdom: 16, charisma: 9 },
        actions: ['Greataxe: +6 to hit, 2d12+4 slashing damage', 'Gore: +6 to hit, 2d8+4 piercing damage'],
        special_abilities: ['Charge', 'Labyrinthine Recall', 'Reckless'],
        description: 'Bull-headed humanoids that guard ancient labyrinths.'
      },
      {
        id: 43, name: 'Hydra', challenge_rating: '8', armor_class: 15, hit_points: 172,
        speed: '30 ft, swim 30 ft', size: 'Huge', type: 'monstrosity', alignment: 'unaligned',
        stats: { strength: 20, dexterity: 12, constitution: 20, intelligence: 2, wisdom: 10, charisma: 7 },
        actions: ['Multiple Bite Attacks: +8 to hit, 1d10+5 piercing damage per head'],
        special_abilities: ['Hold Breath', 'Multiple Heads', 'Reactive Heads', 'Wakeful'],
        description: 'Multi-headed reptilian monsters that grow new heads when injured.'
      },

      // Aberrations
      {
        id: 44, name: 'Mind Flayer', challenge_rating: '7', armor_class: 15, hit_points: 71,
        speed: '30 ft', size: 'Medium', type: 'aberration', alignment: 'lawful evil',
        stats: { strength: 11, dexterity: 12, constitution: 12, intelligence: 19, wisdom: 17, charisma: 17 },
        actions: ['Tentacles: +7 to hit, 2d10+1 psychic + stun', 'Extract Brain: Kill stunned humanoid'],
        special_abilities: ['Magic Resistance', 'Spellcasting'],
        description: 'Aberrant creatures that feed on the brains of intelligent beings.'
      },
      {
        id: 45, name: 'Beholder', challenge_rating: '13', armor_class: 18, hit_points: 180,
        speed: '0 ft, fly 20 ft (hover)', size: 'Large', type: 'aberration', alignment: 'lawful evil',
        stats: { strength: 10, dexterity: 14, constitution: 18, intelligence: 17, wisdom: 15, charisma: 13 },
        actions: ['Bite: +5 to hit, 2d6 piercing damage', 'Eye Rays: 10 different magical eye beams'],
        special_abilities: ['Antimagic Cone', 'Legendary Actions'],
        description: 'Floating orbs covered in eyes with powerful magical abilities.'
      },

      // Plants
      {
        id: 46, name: 'Shambling Mound', challenge_rating: '5', armor_class: 15, hit_points: 136,
        speed: '20 ft, swim 20 ft', size: 'Large', type: 'plant', alignment: 'unaligned',
        stats: { strength: 18, dexterity: 8, constitution: 16, intelligence: 5, wisdom: 10, charisma: 5 },
        actions: ['Slam: +7 to hit, 2d8+4 bludgeoning damage', 'Engulf: Restrain and damage creature'],
        damage_resistances: 'cold, fire',
        damage_immunities: 'lightning',
        special_abilities: ['Lightning Absorption'],
        description: 'Animated masses of vegetation and decay.'
      },
      {
        id: 47, name: 'Treant', challenge_rating: '9', armor_class: 16, hit_points: 138,
        speed: '30 ft', size: 'Huge', type: 'plant', alignment: 'chaotic good',
        stats: { strength: 23, dexterity: 8, constitution: 21, intelligence: 12, wisdom: 16, charisma: 12 },
        actions: ['Slam: +10 to hit, 3d6+6 bludgeoning damage', 'Rock: +10 to hit, 4d10+6 bludgeoning damage'],
        damage_resistances: 'bludgeoning, piercing',
        special_abilities: ['False Appearance', 'Siege Monster'],
        description: 'Ancient tree shepherds that protect the forest.'
      },

      // Celestials
      {
        id: 48, name: 'Deva', challenge_rating: '10', armor_class: 17, hit_points: 136,
        speed: '30 ft, fly 90 ft', size: 'Medium', type: 'celestial', alignment: 'lawful good',
        stats: { strength: 18, dexterity: 18, constitution: 18, intelligence: 17, wisdom: 20, charisma: 20 },
        actions: ['Mace: +8 to hit, 1d6+4 bludgeoning + 4d8 radiant', 'Healing Touch (3/Day): Heal 20 hit points'],
        damage_resistances: 'radiant; bludgeoning, piercing, and slashing from nonmagical attacks',
        special_abilities: ['Angelic Weapons', 'Magic Resistance', 'Spellcasting'],
        description: 'Angelic beings that serve as messengers of the gods.'
      },

      // Final Entries
      {
        id: 49, name: 'Archmage', challenge_rating: '12', armor_class: 17, hit_points: 99,
        speed: '30 ft', size: 'Medium', type: 'humanoid', alignment: 'any alignment',
        stats: { strength: 10, dexterity: 14, constitution: 12, intelligence: 20, wisdom: 15, charisma: 16 },
        actions: ['Dagger: +6 to hit, 1d4+2 piercing damage', 'Spellcasting: 18th-level spellcaster'],
        special_abilities: ['Magic Resistance', 'Spellcasting', 'Legendary Actions'],
        description: 'Master wizards with vast magical knowledge and power.'
      },
      {
        id: 50, name: 'Ancient Red Dragon', challenge_rating: '24', armor_class: 22, hit_points: 546,
        speed: '40 ft, climb 40 ft, fly 80 ft', size: 'Gargantuan', type: 'dragon', alignment: 'chaotic evil',
        stats: { strength: 30, dexterity: 10, constitution: 29, intelligence: 18, wisdom: 15, charisma: 23 },
        actions: ['Bite: +17 to hit, 2d10+10 piercing + fire', 'Fire Breath: 90-foot cone, 26d6 fire damage'],
        damage_immunities: 'fire',
        special_abilities: ['Legendary Actions', 'Legendary Resistance', 'Frightful Presence'],
        description: 'The most powerful and ancient of red dragons, tyrants of the sky.'
      }
    ];

    setBestiary(entries);
  };

  const filterBestiary = () => {
    let filtered = bestiary;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType);
    }

    if (selectedCR !== 'all') {
      filtered = filtered.filter(entry => entry.challenge_rating === selectedCR);
    }

    setFilteredBestiary(filtered);
  };

  const addToParty = async (entry: BestiaryEntry) => {
    const newCharacter: CreateCharacter = {
      campaign_id: 1, // Default campaign
      name: entry.name,
      player_name: '',
      character_class: entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
      level: Math.max(1, Math.floor(parseFloat(entry.challenge_rating.replace('1/', '0.')) * 2)),
      hit_points: entry.hit_points,
      max_hit_points: entry.hit_points,
      armor_class: entry.armor_class,
      strength: entry.stats.strength,
      dexterity: entry.stats.dexterity,
      constitution: entry.stats.constitution,
      intelligence: entry.stats.intelligence,
      wisdom: entry.stats.wisdom,
      charisma: entry.stats.charisma,
      gold: 0,
      is_npc: true,
    };

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharacter),
      });

      if (response.ok) {
        alert('NPC added to party successfully!');
      }
    } catch (error) {
      console.error('Failed to add NPC:', error);
    }
  };

  const creatureTypes = ['all', 'humanoid', 'beast', 'undead', 'dragon', 'elemental', 'fiend', 'fey', 'giant', 'monstrosity', 'construct', 'aberration', 'plant', 'celestial'];
  const challengeRatings = ['all', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '19', '21', '24'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bestiary</h1>
          <p className="text-purple-200">Library of 50 creatures, NPCs, and monsters</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              placeholder="Search creatures..."
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Creature Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {creatureTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-800">
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Challenge Rating</label>
            <select
              value={selectedCR}
              onChange={(e) => setSelectedCR(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {challengeRatings.map((cr) => (
                <option key={cr} value={cr} className="bg-slate-800">
                  {cr === 'all' ? 'All CRs' : `CR ${cr}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-white/70">
        Showing {filteredBestiary.length} of {bestiary.length} creatures
      </div>

      {/* Bestiary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBestiary.map((entry) => (
          <div
            key={entry.id}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-purple-500/30 rounded-xl p-6 transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedEntry(entry)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{entry.name}</h3>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                CR {entry.challenge_rating}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-white/60">Type:</span>
                <span className="text-white capitalize">{entry.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">AC:</span>
                <span className="text-blue-400">{entry.armor_class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">HP:</span>
                <span className="text-red-400">{entry.hit_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Speed:</span>
                <span className="text-white">{entry.speed}</span>
              </div>
            </div>
            
            <p className="text-white/70 text-sm mb-4 line-clamp-3">{entry.description}</p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToParty(entry);
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              Add as NPC
            </button>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedEntry.name}</h2>
                <p className="text-white/70">
                  {selectedEntry.size} {selectedEntry.type}, {selectedEntry.alignment}
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
                  Challenge Rating {selectedEntry.challenge_rating}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stats */}
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Combat Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-blue-400 font-bold text-lg">{selectedEntry.armor_class}</p>
                      <p className="text-white/60">Armor Class</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 font-bold text-lg">{selectedEntry.hit_points}</p>
                      <p className="text-white/60">Hit Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-lg">{selectedEntry.speed}</p>
                      <p className="text-white/60">Speed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Ability Scores</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-white font-bold">{selectedEntry.stats.strength}</p>
                      <p className="text-white/60">STR</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{selectedEntry.stats.dexterity}</p>
                      <p className="text-white/60">DEX</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{selectedEntry.stats.constitution}</p>
                      <p className="text-white/60">CON</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{selectedEntry.stats.intelligence}</p>
                      <p className="text-white/60">INT</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{selectedEntry.stats.wisdom}</p>
                      <p className="text-white/60">WIS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{selectedEntry.stats.charisma}</p>
                      <p className="text-white/60">CHA</p>
                    </div>
                  </div>
                </div>

                {/* Resistances and Immunities */}
                {(selectedEntry.damage_resistances || selectedEntry.damage_immunities || selectedEntry.condition_immunities) && (
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Defenses</h3>
                    {selectedEntry.damage_resistances && (
                      <div className="mb-2">
                        <span className="text-yellow-400 font-medium">Damage Resistances: </span>
                        <span className="text-white/70">{selectedEntry.damage_resistances}</span>
                      </div>
                    )}
                    {selectedEntry.damage_immunities && (
                      <div className="mb-2">
                        <span className="text-green-400 font-medium">Damage Immunities: </span>
                        <span className="text-white/70">{selectedEntry.damage_immunities}</span>
                      </div>
                    )}
                    {selectedEntry.condition_immunities && (
                      <div>
                        <span className="text-blue-400 font-medium">Condition Immunities: </span>
                        <span className="text-white/70">{selectedEntry.condition_immunities}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Abilities and Actions */}
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                  <p className="text-white/70">{selectedEntry.description}</p>
                </div>

                {selectedEntry.special_abilities && (
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Special Abilities</h3>
                    <ul className="space-y-2">
                      {selectedEntry.special_abilities.map((ability, idx) => (
                        <li key={idx} className="text-white/70">• {ability}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEntry.actions && (
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Actions</h3>
                    <ul className="space-y-2">
                      {selectedEntry.actions.map((action, idx) => (
                        <li key={idx} className="text-white/70">• {action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedEntry.senses || selectedEntry.languages) && (
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Senses & Languages</h3>
                    {selectedEntry.senses && (
                      <div className="mb-2">
                        <span className="text-purple-400 font-medium">Senses: </span>
                        <span className="text-white/70">{selectedEntry.senses}</span>
                      </div>
                    )}
                    {selectedEntry.languages && (
                      <div>
                        <span className="text-cyan-400 font-medium">Languages: </span>
                        <span className="text-white/70">{selectedEntry.languages}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => addToParty(selectedEntry)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Add as NPC
              </button>
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
