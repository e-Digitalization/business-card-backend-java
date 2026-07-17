ALTER TABLE client_users
    ADD COLUMN IF NOT EXISTS ai_scan_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE client_users
    ADD COLUMN IF NOT EXISTS scan_subscribed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE client_users
    ADD COLUMN IF NOT EXISTS scan_subscribed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS payment_orders (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES client_users(id),
    order_id VARCHAR(64) NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'TZS',
    purpose VARCHAR(64) NOT NULL DEFAULT 'AI_SCAN_SUBSCRIPTION',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    payment_gateway_url TEXT,
    payment_token VARCHAR(128),
    selcom_reference VARCHAR(128),
    channel VARCHAR(64),
    phone VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_owner ON payment_orders(owner_id);
