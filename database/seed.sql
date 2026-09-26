-- Initial Seed Data for PostgreSQL
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO memberships (membership_id, tier, discount_rate, max_monthly_hours, price_monthly) VALUES
('MB-BASIC', 'BASIC', 0.00, 20, 0.00),
('MB-PRO', 'PRO', 0.15, 80, 100.00),
('MB-ENT', 'ENTERPRISE', 0.30, 9999, 150.00)
ON CONFLICT (tier) DO UPDATE SET price_monthly = EXCLUDED.price_monthly;

INSERT INTO workspaces (workspace_id, name, type, location, description, amenities, opening_hours) VALUES
('WS-ASOKE', 'Antigravity Hub Sukhumvit', 'COWORKING_SPACE', 'Interchange 21, Level 24, BTS Asoke, Bangkok', 'Tech-forward coworking space with panoramic skyline views, fiber internet, and artisan coffee.', '["1 Gbps Fiber WiFi", "Specialty Espresso Bar", "Ergonomic Chairs", "Podcast Studio", "24/7 Access"]'::jsonb, '07:00 - 23:00')
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO members (member_id, name, email, password_hash, phone, member_type, membership_id, reward_points) VALUES
('MEM-001', 'Alex Kittisuk', 'alex.tech@antigravity.dev', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '081-234-5678', 'REGISTERED', 'MB-PRO', 120),
('MEM-002', 'Sarah Enterprise Lead', 'sarah@globalcorp.io', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '089-987-6543', 'REGISTERED', 'MB-ENT', 450)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Admin account: email admin@admin.co.th, password admin123
INSERT INTO members (member_id, name, email, password_hash, phone, member_type, membership_id, is_admin, reward_points) VALUES
('MEM-ADMIN', 'System Administrator', 'admin@admin.co.th', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', NULL, 'REGISTERED', 'MB-ENT', TRUE, 0)
ON CONFLICT (email) DO UPDATE SET is_admin = TRUE;

INSERT INTO rooms (room_id, workspace_id, name, room_type, capacity, price_per_hour, status, has_dual_monitors, has_video_conference, has_whiteboard, equipment_fee, dedicated_desks, has_locker, soundproof_certified) VALUES
('RM-HOT-101', 'WS-ASOKE', 'Hot Desk Alpha #12', 'HOT_DESK', 1, 80.00, 'AVAILABLE', TRUE, FALSE, FALSE, 0.00, 0, FALSE, FALSE),
('RM-PHN-401', 'WS-ASOKE', 'Acoustic Sound Pod #1', 'PHONE_BOOTH', 1, 50.00, 'AVAILABLE', FALSE, FALSE, FALSE, 0.00, 0, FALSE, TRUE),
('RM-MTG-101', 'WS-ASOKE', 'Focus Pod Meeting Room (Compact)', 'MEETING_ROOM', 2, 180.00, 'AVAILABLE', FALSE, TRUE, TRUE, 50.00, 0, FALSE, TRUE),
('RM-MTG-102', 'WS-ASOKE', 'Creative Huddle Room', 'MEETING_ROOM', 4, 250.00, 'AVAILABLE', FALSE, TRUE, TRUE, 100.00, 0, FALSE, FALSE),
('RM-OFF-301', 'WS-ASOKE', 'Executive Suite Alpha', 'PRIVATE_OFFICE', 4, 600.00, 'AVAILABLE', FALSE, FALSE, TRUE, 0.00, 4, TRUE, FALSE),
('RM-MTG-202', 'WS-ASOKE', 'Synergy Brainstorming Lab', 'MEETING_ROOM', 6, 350.00, 'AVAILABLE', TRUE, TRUE, TRUE, 120.00, 0, FALSE, FALSE),
('RM-MTG-201', 'WS-ASOKE', 'Summit Boardroom (8-P)', 'MEETING_ROOM', 8, 450.00, 'AVAILABLE', FALSE, TRUE, TRUE, 150.00, 0, FALSE, FALSE),
('RM-MTG-301', 'WS-ASOKE', 'Executive Strategy Room', 'MEETING_ROOM', 12, 650.00, 'AVAILABLE', TRUE, TRUE, TRUE, 200.00, 0, FALSE, FALSE),
('RM-MTG-302', 'WS-ASOKE', 'Visionary Conference Hall', 'MEETING_ROOM', 20, 950.00, 'AVAILABLE', TRUE, TRUE, TRUE, 300.00, 0, FALSE, FALSE),
('RM-MTG-401', 'WS-ASOKE', 'Grand Auditorium & Town Hall', 'MEETING_ROOM', 40, 1800.00, 'AVAILABLE', TRUE, TRUE, TRUE, 500.00, 0, FALSE, FALSE)
ON CONFLICT (room_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  capacity = EXCLUDED.capacity, 
  price_per_hour = EXCLUDED.price_per_hour,
  equipment_fee = EXCLUDED.equipment_fee,
  status = EXCLUDED.status;

