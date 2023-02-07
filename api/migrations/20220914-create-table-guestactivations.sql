CREATE TABLE `guest_activations` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `guest_user_id` varchar(200) DEFAULT NULL,
  `activation_id` varchar(200) DEFAULT NULL, 
  `purchased_device_id` varchar(200) DEFAULT NULL,  
  `page_id` varchar(200) DEFAULT NULL,
  `is_purchased` BOOLEAN DEFAULT FALSE,
   `is_expire` tinyint(1) DEFAULT '0',
   `subscription_end` datetime NULL ,
   `subscription_start` datetime NULL,
`is_subscribed` TINYINT(1) DEFAULT false,
 `qr_code_usage` varchar(255) DEFAULT '0',
 `purchased_at` datetime DEFAULT NULL,
`qr_code` VARCHAR(255) DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;