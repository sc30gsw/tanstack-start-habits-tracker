ALTER TABLE `records` ADD `recovery_date` text;--> statement-breakpoint
ALTER TABLE `records` ADD `is_recovery_attempt` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `records` ADD `recovery_success` integer;--> statement-breakpoint
ALTER TABLE `records` ADD `original_skipped_record_id` text REFERENCES records(id);--> statement-breakpoint
ALTER TABLE `records` ADD `recovery_attempted_at` text;--> statement-breakpoint
CREATE INDEX `records_recovery_attempt` ON `records` (`habit_id`,`is_recovery_attempt`);--> statement-breakpoint
CREATE INDEX `records_habit_date` ON `records` (`habit_id`,`date`);