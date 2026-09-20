-- ============================================================================
-- COWORKING SPACE BOOKING SYSTEM - DATABASE SCHEMA (PostgreSQL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ENUM Types
CREATE TYPE workspace_type AS ENUM ('COWORKING_SPACE', 'PRIVATE_OFFICE_HUB');
CREATE TYPE room_type AS ENUM ('HOT_DESK', 'MEETING_ROOM', 'PRIVATE_OFFICE', 'PHONE_BOOTH');
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');
CREATE TYPE membership_tier AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE member_type AS ENUM ('REGISTERED', 'GUEST');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Workspaces Table
CREATE TABLE workspaces (
    workspace_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'COWORKING_SPACE',
    location VARCHAR(255) NOT NULL,
    description TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    opening_hours VARCHAR(100) NOT NULL DEFAULT '08:00 - 22:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Memberships Table
CREATE TABLE memberships (
    membership_id VARCHAR(50) PRIMARY KEY,
    tier VARCHAR(50) UNIQUE NOT NULL,
    discount_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_rate >= 0.00 AND discount_rate <= 1.00),
    max_monthly_hours INT NOT NULL CHECK (max_monthly_hours >= 0),
    price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_monthly >= 0.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Members Table
CREATE TABLE members (
    member_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    member_type VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    membership_id VARCHAR(50) NOT NULL REFERENCES memberships(membership_id) ON DELETE RESTRICT,
    reward_points INT NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
    temporary_token VARCHAR(255),
    visa_card_number VARCHAR(30),
    visa_card_holder VARCHAR(120),
    visa_card_expiry VARCHAR(10),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table (Single Table / Joined inheritance mapping)
CREATE TABLE rooms (
    room_id VARCHAR(50) PRIMARY KEY,
    workspace_id VARCHAR(50) NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    price_per_hour DECIMAL(10, 2) NOT NULL CHECK (price_per_hour >= 0.00),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    image_url TEXT,
    
    -- Subtype specific polymorphic columns
    has_dual_monitors BOOLEAN DEFAULT FALSE,
    has_video_conference BOOLEAN DEFAULT FALSE,
    has_whiteboard BOOLEAN DEFAULT FALSE,
    equipment_fee DECIMAL(10, 2) DEFAULT 0.00,
    dedicated_desks INT DEFAULT 0,
    has_locker BOOLEAN DEFAULT FALSE,
    soundproof_certified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (Concurrency & Race-Condition Safe)
CREATE TABLE bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL REFERENCES members(member_id) ON DELETE RESTRICT,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_hours DECIMAL(6, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_booking_time_validity CHECK (end_time > start_time),
    
    -- PostgreSQL Exclusion Constraint: Zero Double Booking
    CONSTRAINT no_overlapping_room_bookings EXCLUDE USING gist (
        room_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status IN ('PENDING', 'CONFIRMED', 'COMPLETED'))
);

CREATE INDEX idx_rooms_workspace_id ON rooms(workspace_id);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_bookings_member ON bookings(member_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time ON bookings USING gist (tstzrange(start_time, end_time, '[)'));
