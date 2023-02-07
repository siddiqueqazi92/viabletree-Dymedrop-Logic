ALTER TABLE `users`
ADD COLUMN `available_amount` DOUBLE DEFAULT 0 AFTER `total_earnings`;
