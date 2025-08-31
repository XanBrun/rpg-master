
-- Seed a default campaign
INSERT INTO campaigns (name, description, master_name, is_active) 
VALUES ('Default Campaign', 'A starter campaign for new games', 'Game Master', 1)
ON CONFLICT DO NOTHING;
