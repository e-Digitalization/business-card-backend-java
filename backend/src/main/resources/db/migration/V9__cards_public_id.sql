ALTER TABLE cards ADD COLUMN public_id UUID;
UPDATE cards SET public_id = gen_random_uuid() WHERE public_id IS NULL;
ALTER TABLE cards ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE cards ADD CONSTRAINT uq_cards_public_id UNIQUE (public_id);
