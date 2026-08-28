-- Collapse the fixed youtube_video_1..3 columns into a single newline-separated
-- list so a card can feature any number of videos. The legacy columns are left
-- in place (unused) so existing data stays recoverable.
ALTER TABLE cards ADD COLUMN youtube_videos TEXT;

UPDATE cards
SET youtube_videos = NULLIF(
    concat_ws(
        E'\n',
        NULLIF(btrim(youtube_video_1), ''),
        NULLIF(btrim(youtube_video_2), ''),
        NULLIF(btrim(youtube_video_3), '')
    ),
    ''
)
WHERE COALESCE(btrim(youtube_video_1), '') <> ''
   OR COALESCE(btrim(youtube_video_2), '') <> ''
   OR COALESCE(btrim(youtube_video_3), '') <> '';
