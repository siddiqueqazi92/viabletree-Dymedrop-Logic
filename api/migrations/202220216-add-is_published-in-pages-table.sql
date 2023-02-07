ALTER TABLE pages
ADD COLUMN `is_published` tinyint(1) DEFAULT '0' AFTER `published_at`;
