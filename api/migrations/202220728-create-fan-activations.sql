CREATE TABLE `fan_activations` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `fan_user_id` varchar(200) DEFAULT NULL,
  `activation_id` varchar(200) DEFAULT NULL,  
  `page_id` varchar(200) DEFAULT NULL,
  `is_purchased` BOOLEAN DEFAULT FALSE,
  `deletedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;