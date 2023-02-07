ALTER TABLE published_pages
ADD COLUMN `perfect_pass` TINYINT(1) DEFAULT false AFTER `image_id`;
