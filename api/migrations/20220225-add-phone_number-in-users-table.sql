ALTER TABLE users
ADD COLUMN `phone_number` varchar(20) DEFAULT NULL,
ADD COLUMN `organization` varchar(50) DEFAULT NULL,
ADD COLUMN `job_title` varchar(50) DEFAULT NULL,
ADD COLUMN `fanbase_size` varchar(20) DEFAULT NULL,
ADD COLUMN `location` varchar(50) DEFAULT NULL,
ADD COLUMN `is_form_submitted` tinyint(1) DEFAULT '0'
