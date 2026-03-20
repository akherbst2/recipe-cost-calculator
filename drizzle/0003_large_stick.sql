CREATE TABLE `abEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testName` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`abGroup` enum('control','treatment') NOT NULL,
	`eventName` varchar(64) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abEvents_id` PRIMARY KEY(`id`)
);
