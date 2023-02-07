ALTER TABLE fan_activations
ADD COLUMN `is_expire` tinyint(1) DEFAULT '0' AFTER `is_subscribed`;
