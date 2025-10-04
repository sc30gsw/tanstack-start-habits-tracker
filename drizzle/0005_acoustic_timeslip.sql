DROP INDEX `workspace_userId`;--> statement-breakpoint
CREATE INDEX `habits_userId` ON `habits` (`user_id`);