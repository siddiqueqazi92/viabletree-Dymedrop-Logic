ALTER TABLE fan_activations
ADD COLUMN `payment_reference` VARCHAR(50) DEFAULT NULL AFTER `qr_code_usage`;
