ALTER TABLE published_page_links
ADD COLUMN `draft_page_link_id` int DEFAULT NULL AFTER `id`;
