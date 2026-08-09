-- ============================================================
-- Studio Management App — Database Schema
-- Photos by Greg | Davis Digital Services | Capstone Milestone 2
-- ============================================================
-- Run this in pgAdmin's Query Tool against your database.
-- Creates two tables: clients and bookings, linked by a foreign key.
-- ============================================================

-- Drop tables if they already exist (safe to re-run during development)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS clients;

-- ------------------------------------------------------------
-- CLIENTS TABLE
-- Stores contact info for each person who has booked a session.
-- ------------------------------------------------------------
CREATE TABLE clients (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(150)  NOT NULL UNIQUE,
    phone      VARCHAR(20),
    created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- BOOKINGS TABLE
-- Each booking belongs to exactly one client (client_id foreign key).
-- If a client is deleted, their bookings are deleted too (ON DELETE CASCADE) —
-- this keeps the database consistent and avoids "orphaned" bookings.
-- ------------------------------------------------------------
CREATE TABLE bookings (
    id              SERIAL PRIMARY KEY,
    client_id       INTEGER       NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_type    VARCHAR(50)   NOT NULL,
    preferred_date  DATE          NOT NULL,
    notes           TEXT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INDEXES
-- Speeds up common lookups: finding all bookings for a client,
-- and finding a client quickly by email.
-- ------------------------------------------------------------
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_clients_email ON clients(email);

-- ------------------------------------------------------------
-- SAMPLE DATA (optional — useful for testing your APIs)
-- ------------------------------------------------------------
INSERT INTO clients (name, email, phone) VALUES
    ('Jordan Rivera', 'jordan@email.com', '(312) 555-0134'),
    ('Alex Chen', 'alex@email.com', '(312) 555-0198');

INSERT INTO bookings (client_id, session_type, preferred_date, notes, status) VALUES
    (1, 'Portrait Session', '2026-08-15', 'Prefer outdoor location if possible', 'pending'),
    (2, 'Family Session', '2026-08-20', NULL, 'confirmed');

-- ------------------------------------------------------------
-- VERIFY: run these after creating tables to confirm it worked
-- ------------------------------------------------------------
-- SELECT * FROM clients;
-- SELECT * FROM bookings;
-- SELECT b.id, c.name, c.email, b.session_type, b.preferred_date, b.status
--   FROM bookings b JOIN clients c ON b.client_id = c.id;
