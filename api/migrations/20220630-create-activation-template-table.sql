CREATE TABLE `activation_admin` (
  
  `id` int NOT NULL AUTO_INCREMENT,
    `activation_name` varchar(200) NOT NULL,
    `activation_price` double NOT NULL,
    `activation_frequency` varchar(100) NOT NULL,
    `activation_description` text NOT NULL,
    `activation_scanlimit` varchar(100) NOT NULL,
    `activation_fanlimit` varchar(100) NOT NULL,
    `activation_promocode` varchar(100)  NULL,
    `published` boolean NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;