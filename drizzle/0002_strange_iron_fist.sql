CREATE TABLE `sharedRecipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareId` varchar(16) NOT NULL,
	`name` varchar(255) NOT NULL,
	`ingredients` text NOT NULL,
	`servings` int NOT NULL,
	`batchMultiplier` int NOT NULL,
	`totalCost` int NOT NULL,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sharedRecipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `sharedRecipes_shareId_unique` UNIQUE(`shareId`)
);
