
CREATE TABLE maps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  grid_size INTEGER DEFAULT 40,
  scale_text TEXT DEFAULT '1 square = 5 feet',
  is_active BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE map_markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  map_id INTEGER NOT NULL,
  x_position REAL NOT NULL,
  y_position REAL NOT NULL,
  marker_type TEXT DEFAULT 'pin',
  color TEXT DEFAULT '#ff0000',
  label TEXT,
  description TEXT,
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE map_drawings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  map_id INTEGER NOT NULL,
  drawing_type TEXT NOT NULL,
  path_data TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  stroke_width INTEGER DEFAULT 2,
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE combat_participants ADD COLUMN conditions TEXT DEFAULT '';
ALTER TABLE combat_participants ADD COLUMN notes TEXT DEFAULT '';
