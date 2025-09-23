ALTER TABLE `records` ADD `notes` text;--> statement-breakpoint
CREATE UNIQUE INDEX `records_habit_id_date_unique` ON `records` (`habit_id`,`date`);