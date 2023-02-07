ALTER TABLE pages
ADD COLUMN `perfect_pass` TINYINT(1) DEFAULT false AFTER `views`;
