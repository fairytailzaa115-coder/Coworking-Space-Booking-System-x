INSERT INTO workspaces (workspace_id, name, type, location, description, opening_hours) VALUES
('WS-KMITL', 'KMITL Convention & Meeting', 'DEALER_SPACE', 'KMITL Ladkrabang Bangkok', 'KMITL Premium Meeting Room and Academic Hub', '08:00 - 20:00'),
('WS-MII', 'Mii Hotel & Space', 'DEALER_SPACE', 'Srinakarin Bangna Bangkok', 'Hotel-grade executive meeting space in Bangna-Srinakarin', '07:00 - 22:00')
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO rooms (room_id, workspace_id, name, room_type, capacity, price_per_hour, status, image_url) VALUES
('RM-MTG-KMITL', 'WS-KMITL', 'KMITL Meeting Room', 'MEETING_ROOM', 16, 750.00, 'AVAILABLE', '/images/meeting-room.jpg'),
('RM-MTG-MII', 'WS-MII', 'Mii Space', 'MEETING_ROOM', 10, 550.00, 'AVAILABLE', '/images/executive-suite.jpg')
ON CONFLICT (room_id) DO UPDATE SET price_per_hour = EXCLUDED.price_per_hour, name = EXCLUDED.name, image_url = EXCLUDED.image_url;

INSERT INTO members (member_id, name, email, password_hash, phone, member_type, membership_id, is_admin, reward_points, dealer_space_name, dealer_space_location, dealer_workspace_id, dealer_room_id) VALUES
('MEM-DLR-001', 'KMITL Partner', 'dealer.kmitl@kmitl.ac.th', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '02-329-8000', 'DEALER', 'MB-ENT', FALSE, 100, 'KMITL Meeting Room', 'KMITL Ladkrabang', 'WS-KMITL', 'RM-MTG-KMITL'),
('MEM-DLR-002', 'Mii Space Partner', 'dealer.mii@miispace.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '02-748-1234', 'DEALER', 'MB-ENT', FALSE, 100, 'Mii Space', 'Bangna Srinakarin', 'WS-MII', 'RM-MTG-MII')
ON CONFLICT (email) DO UPDATE SET 
  member_type = 'DEALER',
  dealer_space_name = EXCLUDED.dealer_space_name,
  dealer_space_location = EXCLUDED.dealer_space_location,
  dealer_workspace_id = EXCLUDED.dealer_workspace_id,
  dealer_room_id = EXCLUDED.dealer_room_id;
