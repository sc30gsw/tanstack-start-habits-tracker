PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_records` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`duration_minutes` integer DEFAULT 0,
	`notes` text,
	`recovery_date` text,
	`is_recovery_attempt` integer DEFAULT false NOT NULL,
	`recovery_success` integer,
	`original_skipped_record_id` text,
	`recovery_attempted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`user_id` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_records`("id", "habit_id", "date", "status", "duration_minutes", "notes", "recovery_date", "is_recovery_attempt", "recovery_success", "original_skipped_record_id", "recovery_attempted_at", "created_at", "updated_at", "user_id") SELECT "id", "habit_id", "date", "status", "duration_minutes", "notes", "recovery_date", "is_recovery_attempt", "recovery_success", "original_skipped_record_id", "recovery_attempted_at", "created_at", "updated_at", "user_id" FROM `records`;--> statement-breakpoint
DROP TABLE `records`;--> statement-breakpoint
ALTER TABLE `__new_records` RENAME TO `records`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `records_userId` ON `records` (`user_id`);--> statement-breakpoint
CREATE INDEX `records_recovery_attempt` ON `records` (`habit_id`,`is_recovery_attempt`);--> statement-breakpoint
CREATE INDEX `records_habit_date` ON `records` (`habit_id`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `records_habit_id_date_unique` ON `records` (`habit_id`,`date`);