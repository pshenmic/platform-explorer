ALTER TABLE blocks ADD COLUMN "epoch" int NULL;

CREATE INDEX blocks_epoch ON blocks(epoch) INCLUDE (height, timestamp, validator_id);
CREATE INDEX blocks_validator_id_epoch ON blocks(validator_id, epoch);
