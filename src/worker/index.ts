import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { 
  CreateCampaignSchema, 
  CreateCharacterSchema, 
  CreateItemSchema
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors());

// Campaign endpoints
app.get("/api/campaigns", async (c) => {
  const db = c.env.DB;
  const campaigns = await db.prepare("SELECT * FROM campaigns ORDER BY created_at DESC").all();
  return c.json(campaigns.results);
});

app.post("/api/campaigns", zValidator("json", CreateCampaignSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  
  const result = await db.prepare(`
    INSERT INTO campaigns (name, description, master_name)
    VALUES (?, ?, ?)
  `).bind(data.name, data.description || null, data.master_name || null).run();
  
  return c.json({ id: result.meta.last_row_id, ...data });
});

app.put("/api/campaigns/:id/activate", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  // First deactivate all campaigns
  await db.prepare("UPDATE campaigns SET is_active = 0").run();
  
  // Then activate the selected one
  await db.prepare("UPDATE campaigns SET is_active = 1 WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// Character endpoints
app.get("/api/characters", async (c) => {
  const db = c.env.DB;
  const characters = await db.prepare("SELECT * FROM characters WHERE is_active = 1 ORDER BY name").all();
  return c.json(characters.results);
});

app.post("/api/characters", zValidator("json", CreateCharacterSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  
  const result = await db.prepare(`
    INSERT INTO characters (
      campaign_id, name, player_name, character_class, level, experience,
      hit_points, max_hit_points, armor_class, strength, dexterity, 
      constitution, intelligence, wisdom, charisma, gold, is_npc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.campaign_id, data.name, data.player_name || null, data.character_class,
    data.level, data.level * 1000, data.hit_points, data.max_hit_points,
    data.armor_class, data.strength, data.dexterity, data.constitution,
    data.intelligence, data.wisdom, data.charisma, data.gold, data.is_npc ? 1 : 0
  ).run();
  
  return c.json({ id: result.meta.last_row_id, ...data });
});

app.post("/api/characters/buy-item", async (c) => {
  const db = c.env.DB;
  const { character_id, item_id } = await c.req.json();
  
  // Get character and item info
  const character = await db.prepare("SELECT * FROM characters WHERE id = ?").bind(character_id).first();
  const item = await db.prepare("SELECT * FROM items WHERE id = ?").bind(item_id).first();
  
  if (!character || !item) {
    return c.json({ error: "Character or item not found" }, 404);
  }
  
  if ((character.gold as number) < (item.price as number)) {
    return c.json({ error: "Not enough gold" }, 400);
  }
  
  if ((character.level as number) < (item.required_level as number)) {
    return c.json({ error: "Level requirement not met" }, 400);
  }
  
  // Deduct gold and add item
  await db.prepare("UPDATE characters SET gold = gold - ? WHERE id = ?").bind(item.price as number, character_id).run();
  await db.prepare(`
    INSERT INTO character_items (character_id, item_id, quantity)
    VALUES (?, ?, 1)
    ON CONFLICT(character_id, item_id) DO UPDATE SET quantity = quantity + 1
  `).bind(character_id, item_id).run();
  
  return c.json({ success: true });
});

// Item endpoints
app.get("/api/items", async (c) => {
  const db = c.env.DB;
  const items = await db.prepare("SELECT * FROM items ORDER BY name").all();
  return c.json(items.results);
});

app.post("/api/items", zValidator("json", CreateItemSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  
  const result = await db.prepare(`
    INSERT INTO items (
      name, description, item_type, price, weight, damage_dice,
      armor_bonus, required_level, is_magical
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.name, data.description || null, data.item_type, data.price,
    data.weight, data.damage_dice || null, data.armor_bonus,
    data.required_level, data.is_magical ? 1 : 0
  ).run();
  
  return c.json({ id: result.meta.last_row_id, ...data });
});

// Combat encounter endpoints
app.get("/api/combat-encounters", async (c) => {
  const db = c.env.DB;
  const encounters = await db.prepare("SELECT * FROM combat_encounters ORDER BY created_at DESC").all();
  return c.json(encounters.results);
});

app.post("/api/combat-encounters", async (c) => {
  const db = c.env.DB;
  const { campaign_id, name, description } = await c.req.json();
  
  const result = await db.prepare(`
    INSERT INTO combat_encounters (campaign_id, name, description)
    VALUES (?, ?, ?)
  `).bind(campaign_id, name, description || null).run();
  
  return c.json({ id: result.meta.last_row_id, campaign_id, name, description });
});

app.put("/api/combat-encounters/:id/start", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  // Deactivate all other encounters
  await db.prepare("UPDATE combat_encounters SET is_active = 0").run();
  
  // Activate this encounter
  await db.prepare(`
    UPDATE combat_encounters 
    SET is_active = 1, current_turn = 0, round_number = 1
    WHERE id = ?
  `).bind(id).run();
  
  // Add all active characters to the encounter with random initiative
  const characters = await db.prepare("SELECT * FROM characters WHERE is_active = 1").all();
  
  for (let i = 0; i < characters.results.length; i++) {
    const character = characters.results[i] as any;
    const initiative = Math.floor(Math.random() * 20) + 1 + Math.floor(((character.dexterity as number) - 10) / 2);
    
    await db.prepare(`
      INSERT INTO combat_participants (encounter_id, character_id, initiative, turn_order, current_hp)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, character.id, initiative, i, character.hit_points).run();
  }
  
  return c.json({ success: true });
});

app.put("/api/combat-encounters/:id/end", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  await db.prepare("UPDATE combat_encounters SET is_active = 0 WHERE id = ?").bind(id).run();
  await db.prepare("DELETE FROM combat_participants WHERE encounter_id = ?").bind(id).run();
  
  return c.json({ success: true });
});

app.put("/api/combat-encounters/:id/next-turn", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  const encounter = await db.prepare("SELECT * FROM combat_encounters WHERE id = ?").bind(id).first();
  if (!encounter) {
    return c.json({ error: "Encounter not found" }, 404);
  }
  
  const participantCount = await db.prepare(`
    SELECT COUNT(*) as count FROM combat_participants WHERE encounter_id = ? AND is_active = 1
  `).bind(id).first();
  
  if (!participantCount) {
    return c.json({ error: "No participants found" }, 404);
  }
  
  let nextTurn = ((encounter.current_turn as number) + 1) % (participantCount.count as number);
  let nextRound = encounter.round_number as number;
  
  if (nextTurn === 0) {
    nextRound++;
  }
  
  await db.prepare(`
    UPDATE combat_encounters 
    SET current_turn = ?, round_number = ?
    WHERE id = ?
  `).bind(nextTurn, nextRound, id).run();
  
  const updatedEncounter = await db.prepare("SELECT * FROM combat_encounters WHERE id = ?").bind(id).first();
  return c.json(updatedEncounter);
});

app.get("/api/combat-encounters/:id/participants", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  const participants = await db.prepare(`
    SELECT 
      cp.*,
      c.name as character_name,
      c.character_class,
      c.level,
      c.max_hit_points,
      c.armor_class,
      c.strength,
      c.dexterity,
      c.constitution,
      c.intelligence,
      c.wisdom,
      c.charisma,
      c.is_npc,
      c.player_name
    FROM combat_participants cp
    JOIN characters c ON cp.character_id = c.id
    WHERE cp.encounter_id = ? AND cp.is_active = 1
    ORDER BY cp.initiative DESC, cp.turn_order ASC
  `).bind(id).all();
  
  // Transform the flat results into nested objects
  const formattedParticipants = participants.results.map((p: any) => ({
    id: p.id,
    encounter_id: p.encounter_id,
    character_id: p.character_id,
    initiative: p.initiative,
    turn_order: p.turn_order,
    current_hp: p.current_hp,
    is_active: p.is_active,
    conditions: p.conditions || '',
    notes: p.notes || '',
    created_at: p.created_at,
    updated_at: p.updated_at,
    character: {
      id: p.character_id,
      name: p.character_name,
      player_name: p.player_name,
      character_class: p.character_class,
      level: p.level,
      max_hit_points: p.max_hit_points,
      armor_class: p.armor_class,
      strength: p.strength,
      dexterity: p.dexterity,
      constitution: p.constitution,
      intelligence: p.intelligence,
      wisdom: p.wisdom,
      charisma: p.charisma,
      is_npc: p.is_npc === 1,
    }
  }));
  
  return c.json(formattedParticipants);
});

// Maps endpoints
app.get("/api/maps", async (c) => {
  const db = c.env.DB;
  const maps = await db.prepare("SELECT * FROM maps ORDER BY created_at DESC").all();
  return c.json(maps.results);
});

app.post("/api/maps", async (c) => {
  const db = c.env.DB;
  const { campaign_id, name, description, image_url, grid_size, scale_text } = await c.req.json();
  
  const result = await db.prepare(`
    INSERT INTO maps (campaign_id, name, description, image_url, grid_size, scale_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(campaign_id, name, description || null, image_url || null, grid_size || 40, scale_text || '1 square = 5 feet').run();
  
  return c.json({ id: result.meta.last_row_id, campaign_id, name, description, image_url, grid_size, scale_text });
});

app.get("/api/maps/:id/markers", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  const markers = await db.prepare("SELECT * FROM map_markers WHERE map_id = ? ORDER BY created_at").bind(id).all();
  return c.json(markers.results);
});

app.post("/api/maps/:id/markers", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  const { x_position, y_position, marker_type, color, label, description } = await c.req.json();
  
  const result = await db.prepare(`
    INSERT INTO map_markers (map_id, x_position, y_position, marker_type, color, label, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, x_position, y_position, marker_type || 'pin', color || '#ff0000', label || null, description || null).run();
  
  return c.json({ id: result.meta.last_row_id, map_id: id, x_position, y_position, marker_type, color, label, description });
});

app.get("/api/maps/:id/drawings", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  const drawings = await db.prepare("SELECT * FROM map_drawings WHERE map_id = ? ORDER BY created_at").bind(id).all();
  return c.json(drawings.results);
});

app.post("/api/maps/:id/drawings", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  const { drawing_type, path_data, color, stroke_width } = await c.req.json();
  
  const result = await db.prepare(`
    INSERT INTO map_drawings (map_id, drawing_type, path_data, color, stroke_width)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, drawing_type, path_data, color || '#000000', stroke_width || 2).run();
  
  return c.json({ id: result.meta.last_row_id, map_id: id, drawing_type, path_data, color, stroke_width });
});

app.delete("/api/maps/:id/drawings", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  
  await db.prepare("DELETE FROM map_drawings WHERE map_id = ?").bind(id).run();
  return c.json({ success: true });
});

// Combat action endpoints
app.post("/api/combat-encounters/:id/action", async (c) => {
  const db = c.env.DB;
  const { action, targetId, details } = await c.req.json();
  
  // Get target if specified
  let target = null;
  if (targetId) {
    target = await db.prepare("SELECT * FROM combat_participants WHERE id = ?").bind(targetId).first();
  }
  
  // Process action
  switch (action) {
    case 'attack':
    case 'damage':
      if (target && details.damage) {
        const newHp = Math.max(0, (target.current_hp as number) - details.damage);
        await db.prepare("UPDATE combat_participants SET current_hp = ? WHERE id = ?").bind(newHp, targetId).run();
      }
      break;
      
    case 'heal':
      if (target && details.heal) {
        const character = await db.prepare("SELECT max_hit_points FROM characters WHERE id = ?").bind(target.character_id).first();
        if (character) {
          const newHp = Math.min((character.max_hit_points as number), (target.current_hp as number) + details.heal);
          await db.prepare("UPDATE combat_participants SET current_hp = ? WHERE id = ?").bind(newHp, targetId).run();
        }
      }
      break;
      
    case 'condition':
      if (target && details.condition) {
        const currentConditions = (target.conditions as string) || '';
        const newConditions = currentConditions ? `${currentConditions}, ${details.condition}` : details.condition;
        await db.prepare("UPDATE combat_participants SET conditions = ? WHERE id = ?").bind(newConditions, targetId).run();
      }
      break;
  }
  
  return c.json({ success: true });
});

app.put("/api/combat-participants/:id/hp", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  const { current_hp } = await c.req.json();
  
  await db.prepare("UPDATE combat_participants SET current_hp = ? WHERE id = ?").bind(current_hp, id).run();
  return c.json({ success: true });
});

app.put("/api/combat-participants/:id/conditions", async (c) => {
  const db = c.env.DB;
  const id = parseInt(c.req.param("id"));
  const { conditions } = await c.req.json();
  
  await db.prepare("UPDATE combat_participants SET conditions = ? WHERE id = ?").bind(conditions || '', id).run();
  return c.json({ success: true });
});

app.post("/api/combat-encounters/:id/add-participants", async (c) => {
  const db = c.env.DB;
  const encounterId = parseInt(c.req.param("id"));
  const { characterIds } = await c.req.json();
  
  for (const characterId of characterIds) {
    const character = await db.prepare("SELECT * FROM characters WHERE id = ?").bind(characterId).first();
    if (character) {
      const initiative = Math.floor(Math.random() * 20) + 1 + Math.floor(((character.dexterity as number) - 10) / 2);
      
      // Check if character is already in encounter
      const existing = await db.prepare("SELECT * FROM combat_participants WHERE encounter_id = ? AND character_id = ?").bind(encounterId, characterId).first();
      
      if (!existing) {
        await db.prepare(`
          INSERT INTO combat_participants (encounter_id, character_id, initiative, turn_order, current_hp)
          VALUES (?, ?, ?, ?, ?)
        `).bind(encounterId, characterId, initiative, 0, character.hit_points).run();
      }
    }
  }
  
  return c.json({ success: true });
});

// Data management endpoints
app.get("/api/export", async (c) => {
  const db = c.env.DB;
  
  const campaigns = await db.prepare("SELECT * FROM campaigns").all();
  const characters = await db.prepare("SELECT * FROM characters").all();
  const items = await db.prepare("SELECT * FROM items").all();
  const character_items = await db.prepare("SELECT * FROM character_items").all();
  const combat_encounters = await db.prepare("SELECT * FROM combat_encounters").all();
  
  const exportData = {
    campaigns: campaigns.results,
    characters: characters.results,
    items: items.results,
    character_items: character_items.results,
    combat_encounters: combat_encounters.results,
    exported_at: new Date().toISOString(),
  };
  
  return c.json(exportData, 200, {
    'Content-Type': 'application/json',
    'Content-Disposition': 'attachment; filename="rpg-master-export.json"'
  });
});

app.post("/api/import", async (c) => {
  // This would handle importing data from uploaded files
  // For now, just return success
  return c.json({ success: true, message: "Import functionality coming soon" });
});

// Seed some default items if none exist
app.get("/api/seed", async (c) => {
  const db = c.env.DB;
  
  const itemCount = await db.prepare("SELECT COUNT(*) as count FROM items").first();
  
  if (!itemCount || (itemCount.count as number) === 0) {
    const defaultItems = [
      // Weapons
      { name: "Shortsword", item_type: "Weapon", price: 10, weight: 2, damage_dice: "1d6", required_level: 1 },
      { name: "Longsword", item_type: "Weapon", price: 15, weight: 3, damage_dice: "1d8", required_level: 1 },
      { name: "Greatsword", item_type: "Weapon", price: 50, weight: 6, damage_dice: "2d6", required_level: 3 },
      { name: "Dagger", item_type: "Weapon", price: 2, weight: 1, damage_dice: "1d4", required_level: 1 },
      { name: "Crossbow", item_type: "Weapon", price: 25, weight: 5, damage_dice: "1d8", required_level: 2 },
      
      // Armor
      { name: "Leather Armor", item_type: "Armor", price: 10, weight: 10, armor_bonus: 1, required_level: 1 },
      { name: "Chain Mail", item_type: "Armor", price: 75, weight: 55, armor_bonus: 4, required_level: 3 },
      { name: "Plate Armor", item_type: "Armor", price: 1500, weight: 65, armor_bonus: 8, required_level: 5 },
      { name: "Shield", item_type: "Shield", price: 10, weight: 6, armor_bonus: 2, required_level: 1 },
      
      // Potions
      { name: "Healing Potion", item_type: "Potion", price: 50, weight: 0.5, description: "Restores 2d4+2 hit points", required_level: 1 },
      { name: "Greater Healing Potion", item_type: "Potion", price: 150, weight: 0.5, description: "Restores 4d4+4 hit points", required_level: 3 },
      { name: "Potion of Strength", item_type: "Potion", price: 300, weight: 0.5, description: "Increases Strength to 21 for 1 hour", required_level: 5, is_magical: true },
      
      // Gear
      { name: "Rope (50 feet)", item_type: "Adventuring Gear", price: 2, weight: 10, required_level: 1 },
      { name: "Torch", item_type: "Adventuring Gear", price: 1, weight: 1, required_level: 1 },
      { name: "Thieves' Tools", item_type: "Tool", price: 25, weight: 1, required_level: 1 },
      { name: "Backpack", item_type: "Adventuring Gear", price: 2, weight: 5, required_level: 1 },
      
      // Food
      { name: "Rations (1 day)", item_type: "Food", price: 2, weight: 2, required_level: 1 },
      { name: "Waterskin", item_type: "Food", price: 2, weight: 5, required_level: 1 },
      
      // Scrolls
      { name: "Scroll of Cure Light Wounds", item_type: "Scroll", price: 25, weight: 0, description: "Heals 1d8+1 hit points", required_level: 1, is_magical: true },
      { name: "Scroll of Magic Missile", item_type: "Scroll", price: 25, weight: 0, description: "3 magic missiles dealing 1d4+1 each", required_level: 1, is_magical: true },
    ];
    
    for (const item of defaultItems) {
      await db.prepare(`
        INSERT INTO items (name, description, item_type, price, weight, damage_dice, armor_bonus, required_level, is_magical)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.name,
        item.description || null,
        item.item_type,
        item.price,
        item.weight,
        item.damage_dice || null,
        item.armor_bonus || 0,
        item.required_level,
        item.is_magical ? 1 : 0
      ).run();
    }
  }
  
  return c.json({ success: true, message: "Database seeded successfully" });
});

export default app;
