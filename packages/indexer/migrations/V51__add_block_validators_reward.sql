ALTER TABLE blocks
ADD COLUMN "validators_reward" bigint DEFAULT null;

CREATE INDEX block_validators_reward ON blocks (validators_reward);