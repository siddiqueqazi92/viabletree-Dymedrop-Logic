ALTER TABLE pages
ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `is_published`;
