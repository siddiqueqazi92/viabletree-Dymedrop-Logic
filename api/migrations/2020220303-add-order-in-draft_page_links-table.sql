ALTER TABLE draft_page_links
ADD COLUMN `order` INT DEFAULT 0 AFTER `id`;
