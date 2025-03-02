CREATE TABLE `conf` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `post` (
	`pid` integer PRIMARY KEY NOT NULL,
	`tid` integer DEFAULT 0 NOT NULL,
	`uid` integer DEFAULT 0 NOT NULL,
	`access` integer DEFAULT 0 NOT NULL,
	`create_date` integer DEFAULT 0 NOT NULL,
	`quote_pid` integer DEFAULT 0 NOT NULL,
	`content` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `thread` (
	`tid` integer PRIMARY KEY NOT NULL,
	`uid` integer DEFAULT 0 NOT NULL,
	`access` integer DEFAULT 0 NOT NULL,
	`is_top` integer DEFAULT 0 NOT NULL,
	`create_date` integer DEFAULT 0 NOT NULL,
	`last_date` integer DEFAULT 0 NOT NULL,
	`last_uid` integer DEFAULT 0 NOT NULL,
	`posts` integer DEFAULT 0 NOT NULL,
	`subject` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`uid` integer PRIMARY KEY NOT NULL,
	`gid` integer DEFAULT 0 NOT NULL,
	`mail` text DEFAULT '' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`hash` text DEFAULT '' NOT NULL,
	`salt` text DEFAULT '' NOT NULL,
	`threads` integer DEFAULT 0 NOT NULL,
	`posts` integer DEFAULT 0 NOT NULL,
	`credits` integer DEFAULT 0 NOT NULL,
	`golds` integer DEFAULT 0 NOT NULL,
	`create_date` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_mail_unique` ON `user` (`mail`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_name_unique` ON `user` (`name`);