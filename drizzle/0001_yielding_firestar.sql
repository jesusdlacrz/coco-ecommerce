CREATE TABLE `pending_checkouts` (
	`reference` text PRIMARY KEY NOT NULL,
	`vendor_slug` text,
	`cart_json` text NOT NULL,
	`customer_json` text NOT NULL,
	`amount_in_cents` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`woo_order_id` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pending_checkouts_status` ON `pending_checkouts` (`status`);