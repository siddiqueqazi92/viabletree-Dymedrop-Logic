ALTER TABLE users
ADD COLUMN `account_setup` tinyint(1) DEFAULT 0,
ADD COLUMN `total_earnings` varchar(255) DEFAULT '0';
