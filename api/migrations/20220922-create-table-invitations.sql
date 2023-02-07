CREATE TABLE `invitations` (
  
  `id` int NOT NULL AUTO_INCREMENT,
  `page_id` int DEFAULT NULL,
  `fullname` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `user_id` varchar(200) DEFAULT NULL,
  `accepted` varchar(200) DEFAULT NULL,
  `page_owner` varchar(200) DEFAULT NULL,
  
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;