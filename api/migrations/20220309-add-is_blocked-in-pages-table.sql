ALTER TABLE pages
ADD COLUMN `is_blocked` tinyint(1) DEFAULT '0' AFTER `is_published`;