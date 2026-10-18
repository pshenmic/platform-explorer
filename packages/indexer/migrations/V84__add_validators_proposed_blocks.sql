ALTER TABLE validators ADD COLUMN "proposed_blocks_count" int NOT NULL DEFAULT 0;
ALTER TABLE validators ADD COLUMN "last_proposed_block_height" int NULL;
