CREATE TABLE `draft_page_contact_buttons` (
  
  `id` int NOT NULL AUTO_INCREMENT,
  `page_id` int DEFAULT NULL,
  `hudl` varchar(200) DEFAULT NULL,
  `maxpreps` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fb` varchar(200) DEFAULT NULL,
  `insta` varchar(200) DEFAULT NULL,
  `linkedin` varchar(200) DEFAULT NULL,
  `medium` varchar(200) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pinterest` varchar(200) DEFAULT NULL,
  `reddit` varchar(200) DEFAULT NULL,
  `snapchat` varchar(200) DEFAULT NULL,
  `tiktok` varchar(200) DEFAULT NULL,
  `twitch` varchar(200) DEFAULT NULL,
  `twitter` varchar(200) DEFAULT NULL,
  `youtube` varchar(200) DEFAULT NULL,
  
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;