ALTER TABLE validators
ADD COLUMN "voting_public_key_hash" varchar(40);

CREATE INDEX idx_validators_voting_public_key_hash ON validators(voting_public_key_hash)
