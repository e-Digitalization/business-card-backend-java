CREATE TABLE IF NOT EXISTS client_users (
    id BIGSERIAL PRIMARY KEY,
    google_sub VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    picture_url TEXT,
    card_id BIGINT UNIQUE REFERENCES cards(id)
);
