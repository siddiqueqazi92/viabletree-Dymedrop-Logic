CREATE TABLE `users` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `user_id` varchar(200) DEFAULT NULL,  
  `email` varchar(200) DEFAULT NULL,
  `first_name` varchar(30) DEFAULT NULL,
  `last_name` varchar(30) DEFAULT NULL,
  `avatar` varchar(200) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_blocked` BOOLEAN DEFAULT FALSE,
  
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;