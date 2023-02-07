CREATE TABLE `pages` (
  
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(200) NOT NULL,
  `published_at` datetime DEFAULT NULL,
  
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;