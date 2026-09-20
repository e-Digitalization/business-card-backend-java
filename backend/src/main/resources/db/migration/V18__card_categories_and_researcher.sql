-- A card can belong to several profile categories (researcher, banker,
-- government, ...), stored as a comma-separated list of category ids.
-- Researcher details (metrics, citations per year, publications) live in one
-- JSON document so the shape can grow without further migrations.
ALTER TABLE cards
    ADD COLUMN categories TEXT,
    ADD COLUMN researcher_data TEXT;
