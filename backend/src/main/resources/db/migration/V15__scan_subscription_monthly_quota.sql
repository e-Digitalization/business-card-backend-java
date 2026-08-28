-- The AI Scan Monthly plan now grants a fixed number of card scans per billing
-- month instead of being unlimited. Track how many have been used in the current
-- subscription period; this resets to 0 each time the subscription is renewed.
ALTER TABLE client_users
    ADD COLUMN IF NOT EXISTS scan_subscription_used INTEGER NOT NULL DEFAULT 0;
