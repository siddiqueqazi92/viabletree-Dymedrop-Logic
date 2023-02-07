ALTER TABLE `fan_activations`
ADD COLUMN `qr_code_usage` varchar(255) DEFAULT '0' AFTER `qr_code`;
