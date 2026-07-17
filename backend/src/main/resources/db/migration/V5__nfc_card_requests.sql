ALTER TABLE payment_orders
    ADD COLUMN IF NOT EXISTS nfc_request_id BIGINT;

CREATE TABLE IF NOT EXISTS nfc_card_requests (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES client_users(id),
    product_code VARCHAR(64) NOT NULL DEFAULT 'NFC_CARD',
    product_name VARCHAR(255) NOT NULL DEFAULT 'Kadi Moja NFC Card',
    amount INTEGER NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'TZS',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_order_id VARCHAR(64) UNIQUE,
    phone VARCHAR(32),
    delivery_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nfc_card_requests_owner ON nfc_card_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_nfc_card_requests_status ON nfc_card_requests(status);
