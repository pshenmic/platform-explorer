ALTER TABLE blocks ADD COLUMN "epoch" int NULL;

CREATE INDEX blocks_epoch ON blocks(epoch);
