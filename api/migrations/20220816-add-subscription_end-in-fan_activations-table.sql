ALTER TABLE fan_activations
ADD COLUMN `subscription_end` datetime NULL AFTER `payment_reference`,
ADD COLUMN `subscription_start` datetime NULL AFTER `payment_reference`;
