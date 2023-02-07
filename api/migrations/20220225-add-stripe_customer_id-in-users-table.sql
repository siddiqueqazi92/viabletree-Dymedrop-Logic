ALTER TABLE users
ADD COLUMN `customer_stripe_id` varchar(255) AFTER `user_id`;
