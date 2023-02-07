ALTER TABLE published_page_links
ADD COLUMN `clicks` int DEFAULT 0 AFTER `action`;
