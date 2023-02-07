CREATE TABLE `transfers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` varchar(250) DEFAULT NULL,
    `page_id` varchar(200) NOT NULL,
    `activation_id` varchar(250) DEFAULT NULL,
    `purchase_id` varchar(250) DEFAULT NULL,
    `amount` varchar(250) DEFAULT NULL,
    `transfer_date` varchar(250) DEFAULT NULL,
    `createdAt` varchar(250) DEFAULT NULL,
    `updatedAt` datetime DEFAULT NULL,
    `deletedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;