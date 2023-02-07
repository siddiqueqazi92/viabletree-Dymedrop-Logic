ALTER TABLE `fan_activations`
ADD COLUMN `purchased_at` datetime DEFAULT NULL AFTER `is_purchased`;
