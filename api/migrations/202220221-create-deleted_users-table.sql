CREATE TABLE `deleted_users` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `user_id` varchar(200) NOT NULL,  
  `email` varchar(200) DEFAULT NULL,
  
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;