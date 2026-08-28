-- Pending email/password sign-ups awaiting OTP confirmation. A row here is not
-- a real account yet; verifyRegistration promotes it into client_users.
CREATE TABLE email_verifications (
    id             BIGSERIAL PRIMARY KEY,
    email          VARCHAR(255) NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    otp_hash       VARCHAR(255) NOT NULL,
    attempts       INTEGER NOT NULL DEFAULT 0,
    expires_at     TIMESTAMPTZ NOT NULL,
    consumed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_email ON email_verifications (LOWER(email));

-- Drop the historically seeded default admin (guessable "admin" username). Safe:
-- admin_users has no inbound foreign keys, and this only removes a row that was
-- never promoted to an active, in-use account.
DELETE FROM admin_users WHERE username = 'admin' AND active = FALSE;
