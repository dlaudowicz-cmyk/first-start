CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`field_name` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'offen' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `curriculum_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`hours_total` real DEFAULT 0 NOT NULL,
	`hours_theory` real DEFAULT 0 NOT NULL,
	`hours_practice` real DEFAULT 0 NOT NULL,
	`learning_goal` text,
	`qualification_content` text,
	`application_competence` text,
	`practical_task` text,
	`learning_result` text,
	`assessment` text,
	`teaching_methods` text,
	`tools` text,
	`status` text DEFAULT 'entwurf' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`duplicate_of_module_id` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `curriculum_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`required` integer DEFAULT true NOT NULL,
	`notes` text,
	FOREIGN KEY (`module_id`) REFERENCES `curriculum_modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`export_type` text NOT NULL,
	`format` text NOT NULL,
	`version_id` text,
	`created_by` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`content` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`version_id`) REFERENCES `versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`institution` text,
	`owner` text,
	`status` text DEFAULT 'entwurf' NOT NULL,
	`target_hours` integer DEFAULT 400 NOT NULL,
	`start_date` text,
	`description` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teaching_materials` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text,
	`workshop_day_id` text,
	`type` text,
	`title` text NOT NULL,
	`description` text,
	`file_url` text,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'entwurf' NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `curriculum_modules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workshop_day_id`) REFERENCES `workshop_days`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text,
	`category` text,
	`purpose` text,
	`pricing` text,
	`license_model` text,
	`commercial_use` text,
	`privacy_notes` text,
	`min_age` integer,
	`strengths` text,
	`weaknesses` text,
	`alternatives` text,
	`status` text DEFAULT 'aktiv' NOT NULL,
	`last_reviewed` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'leser' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `versions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`label` text,
	`status` text DEFAULT 'entwurf' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`snapshot` text NOT NULL,
	`change_log` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workshop_day_modules` (
	`workshop_day_id` text NOT NULL,
	`module_id` text NOT NULL,
	PRIMARY KEY(`workshop_day_id`, `module_id`),
	FOREIGN KEY (`workshop_day_id`) REFERENCES `workshop_days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `curriculum_modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workshop_days` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`title` text NOT NULL,
	`goal` text,
	`hours` real DEFAULT 0 NOT NULL,
	`theory` text,
	`live_demo` text,
	`exercise` text,
	`group_task` text,
	`output` text,
	`required_tools` text,
	`required_accounts` text,
	`required_hardware` text,
	`homework` text,
	`notes` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
