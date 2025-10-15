CREATE TABLE `habit_levels` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`unique_completion_days` integer DEFAULT 0 NOT NULL,
	`completion_level` integer DEFAULT 1 NOT NULL,
	`total_hours_decimal` real DEFAULT 0 NOT NULL,
	`hours_level` integer DEFAULT 1 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_activity_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`user_id` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `habit_levels_habit_id_unique` ON `habit_levels` (`habit_id`);--> statement-breakpoint
CREATE INDEX `habit_levels_habitId` ON `habit_levels` (`habit_id`);--> statement-breakpoint
CREATE INDEX `habit_levels_userId` ON `habit_levels` (`user_id`);--> statement-breakpoint

-- 既存習慣の habit_levels レコード自動登録
-- records テーブルから統計情報を集計して初期化
INSERT INTO habit_levels (
  id,
  habit_id,
  user_id,
  unique_completion_days,
  total_hours_decimal,
  last_activity_date,
  completion_level,
  hours_level,
  current_streak,
  longest_streak,
  created_at,
  updated_at
)
SELECT
  'hl-' || lower(hex(randomblob(16))) as id,
  h.id as habit_id,
  h.user_id as user_id,
  COALESCE(
    (SELECT COUNT(DISTINCT r.date)
     FROM records r
     WHERE r.habit_id = h.id AND r.status = 'completed'),
    0
  ) as unique_completion_days,
  COALESCE(
    (SELECT CAST(SUM(r.duration_minutes) AS REAL) / 60.0
     FROM records r
     WHERE r.habit_id = h.id AND r.status = 'completed'),
    0.0
  ) as total_hours_decimal,
  (SELECT r.date
   FROM records r
   WHERE r.habit_id = h.id AND r.status = 'completed'
   ORDER BY r.date DESC
   LIMIT 1) as last_activity_date,
  1 as completion_level,
  1 as hours_level,
  0 as current_streak,
  0 as longest_streak,
  CURRENT_TIMESTAMP as created_at,
  CURRENT_TIMESTAMP as updated_at
FROM habits h
WHERE NOT EXISTS (
  SELECT 1 FROM habit_levels hl WHERE hl.habit_id = h.id
);