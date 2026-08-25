ALTER TABLE admin_users ADD COLUMN active BOOLEAN;
UPDATE admin_users SET active = TRUE WHERE active IS NULL;
ALTER TABLE admin_users ALTER COLUMN active SET NOT NULL;
ALTER TABLE admin_users ALTER COLUMN active SET DEFAULT TRUE;

ALTER TABLE admin_users ADD COLUMN created_at TIMESTAMPTZ;
UPDATE admin_users SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE admin_users ALTER COLUMN created_at SET NOT NULL;
