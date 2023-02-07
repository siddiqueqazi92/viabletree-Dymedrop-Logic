ALTER TABLE sales
ADD COLUMN `activation_id` INT DEFAULT NULL AFTER `fan_or_guest_activation_id`;
