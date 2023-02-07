CREATE TABLE `link_clicks` (
  
  `id` int NOT NULL AUTO_INCREMENT,  
  `link_id` int NOT NULL,  
  `clicks` int DEFAULT 0,  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;