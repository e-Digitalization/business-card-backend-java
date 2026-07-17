CREATE TABLE IF NOT EXISTS saved_contacts (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    title VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    website VARCHAR(512),
    location VARCHAR(255),
    whatsapp VARCHAR(255),
    photo_url TEXT,
    source_profile_slug VARCHAR(255),
    source VARCHAR(50) DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_contacts_owner ON saved_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_saved_contacts_owner_slug ON saved_contacts(owner_id, source_profile_slug);
