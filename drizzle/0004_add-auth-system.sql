ALTER TABLE `settings` RENAME TO `accounts`;--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS "habits_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "workspace_userId";--> statement-breakpoint
DROP INDEX IF EXISTS "records_userId";--> statement-breakpoint
DROP INDEX IF EXISTS "records_habit_id_date_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "sessions_token_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
ALTER TABLE `accounts` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer));--> statement-breakpoint
CREATE UNIQUE INDEX `habits_name_unique` ON `habits` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `records_habit_id_date_unique` ON `records` (`habit_id`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `accounts` ADD `account_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `provider_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `user_id` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `accounts` ADD `access_token` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `refresh_token` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `id_token` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `access_token_expires_at` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `refresh_token_expires_at` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `scope` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `password` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` DROP COLUMN `theme`;--> statement-breakpoint
ALTER TABLE `accounts` DROP COLUMN `default_view`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "image", "created_at", "updated_at") SELECT "id", "name", "email", "email_verified", "image", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `habits` ADD `user_id` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `records` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `records` ADD `user_id` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `workspace_userId` ON `habits` (`user_id`);--> statement-breakpoint
CREATE INDEX `records_userId` ON `records` (`user_id`);