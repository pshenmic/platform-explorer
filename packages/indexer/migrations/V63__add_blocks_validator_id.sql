ALTER TABLE blocks
ADD COLUMN "validator_id" int NOT NULL references validators(id);

CREATE INDEX idx_validator_id ON blocks(validator_id)
