CREATE TABLE `sharedpage` (
    `id` int NOT NULL AUTO_INCREMENT,
    `page_id` int DEFAULT NULL,
    `shared_user_id` varchar(200) DEFAULT NULL,
    `page_owner_id` varchar(100) DEFAULT NULL,
    `is_shared` tinyint(1) DEFAULT NULL,
    `is_removed` tinyint(1) DEFAULT NULL,
    `createdAt` datetime DEFAULT NULL,
    `updatedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;