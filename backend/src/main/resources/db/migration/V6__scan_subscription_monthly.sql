ALTER TABLE client_users
    ADD COLUMN IF NOT EXISTS scan_subscription_expires_at TIMESTAMPTZ;
