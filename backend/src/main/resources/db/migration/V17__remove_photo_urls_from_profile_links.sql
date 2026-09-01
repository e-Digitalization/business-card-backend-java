UPDATE cards
SET website = NULL
WHERE website = photo_url
   OR website LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET linkedin = NULL
WHERE linkedin = photo_url
   OR linkedin LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET twitter = NULL
WHERE twitter = photo_url
   OR twitter LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET github = NULL
WHERE github = photo_url
   OR github LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET instagram = NULL
WHERE instagram = photo_url
   OR instagram LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET youtube_channel = NULL
WHERE youtube_channel = photo_url
   OR youtube_channel LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET booking_url = NULL
WHERE booking_url = photo_url
   OR booking_url LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET podcast_url = NULL
WHERE podcast_url = photo_url
   OR podcast_url LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET tiktok = NULL
WHERE tiktok = photo_url
   OR tiktok LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET telegram = NULL
WHERE telegram = photo_url
   OR telegram LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET wechat = NULL
WHERE wechat = photo_url
   OR wechat LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET weibo = NULL
WHERE weibo = photo_url
   OR weibo LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET douyin = NULL
WHERE douyin = photo_url
   OR douyin LIKE 'https://%.googleusercontent.com/%';

UPDATE cards
SET xiaohongshu = NULL
WHERE xiaohongshu = photo_url
   OR xiaohongshu LIKE 'https://%.googleusercontent.com/%';
