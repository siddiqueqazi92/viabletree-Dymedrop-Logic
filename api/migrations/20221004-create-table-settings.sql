CREATE TABLE `settings` (
    `id` int NOT NULL AUTO_INCREMENT,
    `type` varchar(200) NOT NULL,
    `value` varchar(250) DEFAULT NULL,
    `createdAt` datetime DEFAULT NULL,
    `updatedAt` datetime DEFAULT NULL,
    `deletedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;