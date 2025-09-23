DROP INDEX "habits_name_unique";--> statement-breakpoint
DROP INDEX "records_habit_id_date_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `settings` ALTER COLUMN "theme" TO "theme" text DEFAULT 'auto';--> statement-breakpoint
CREATE UNIQUE INDEX `habits_name_unique` ON `habits` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `records_habit_id_date_unique` ON `records` (`habit_id`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `habits` ADD `color` text DEFAULT 'blue';