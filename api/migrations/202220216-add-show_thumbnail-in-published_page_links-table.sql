ALTER TABLE published_page_links
ADD COLUMN `show_thumbnail` TINYINT DEFAULT 0 AFTER `thumbnail`;
