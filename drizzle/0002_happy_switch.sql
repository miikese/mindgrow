CREATE TABLE `learner_rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`profile` text NOT NULL,
	`kind` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`hints` integer DEFAULT 0 NOT NULL,
	`reason` text NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL,
	`context` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`profile`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learner_rewards_profile` ON `learner_rewards` (`profile`,`created`);
