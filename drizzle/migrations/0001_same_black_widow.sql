PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notice` (
	`nid` integer PRIMARY KEY NOT NULL,
	`tid` integer NOT NULL,
	`uid` integer NOT NULL,
	`last_pid` integer DEFAULT 0 NOT NULL,
	`read_pid` integer DEFAULT 0 NOT NULL,
	`unread` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_notice`("nid", "tid", "uid", "last_pid", "read_pid", "unread") SELECT "nid", "tid", "uid", "last_pid", "read_pid", "unread" FROM `notice`;--> statement-breakpoint
DROP TABLE `notice`;--> statement-breakpoint
ALTER TABLE `__new_notice` RENAME TO `notice`;--> statement-breakpoint
PRAGMA foreign_keys=ON;