CREATE TABLE `page_views` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `page_id` int NOT NULL,  
  `views` int DEFAULT 0,  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;