ALTER TABLE fan_activations
ADD COLUMN `is_subscribed` TINYINT(1) DEFAULT false AFTER `is_purchased`;
