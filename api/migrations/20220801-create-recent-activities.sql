CREATE TABLE `recent_activities` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `user_id` int(10) DEFAULT NULL,
  `activation_id` int(10) DEFAULT NULL,  
  `page_id` varchar(200) DEFAULT NULL,
  `type` varchar(200) DEFAULT NULL,
  `count` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;