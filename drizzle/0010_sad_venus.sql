ALTER TABLE `records` RENAME COLUMN "completed" TO "status";--> statement-breakpoint
-- Update existing boolean values to status strings
UPDATE `records` SET "status" = CASE
  WHEN "status" = '1' OR "status" = 'true' OR "status" = 1 THEN 'completed'
  WHEN "status" = '0' OR "status" = 'false' OR "status" = 0 THEN 'active'
  ELSE 'active'
END;--> statement-breakpoint
DROP INDEX IF EXISTS "habits_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "habits_userId";--> statement-breakpoint
DROP INDEX IF EXISTS "records_userId";--> statement-breakpoint
DROP INDEX IF EXISTS "records_habit_id_date_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "sessions_token_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
ALTER TABLE `records` ALTER COLUMN "status" TO "status" text NOT NULL DEFAULT 'active';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `habits_name_unique` ON `habits` (`name`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `habits_userId` ON `habits` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `records_userId` ON `records` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `records_habit_id_date_unique` ON `records` (`habit_id`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);