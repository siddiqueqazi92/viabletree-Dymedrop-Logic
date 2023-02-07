ALTER TABLE pages
ADD COLUMN `views` int DEFAULT 0 AFTER `url`;
