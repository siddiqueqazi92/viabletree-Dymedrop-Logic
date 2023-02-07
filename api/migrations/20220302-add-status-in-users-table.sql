ALTER TABLE users
ADD COLUMN `status` varchar(24) DEFAULT 'registered' AFTER `is_form_submitted`;
