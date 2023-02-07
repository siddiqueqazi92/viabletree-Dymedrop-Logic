CREATE TABLE `sales` (
  
   `id` int NOT NULL AUTO_INCREMENT, 
  `fan_or_guest_activation_id` INT DEFAULT NULL,    
  `total` double NOT NULL,
  `creator_share` double NOT NULL,
  `admin_share` double NOT NULL,
  `is_guest` TINYINT DEFAULT '0',  
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;