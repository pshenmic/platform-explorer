ALTER TABLE identities ADD COLUMN "type" varchar(24) NOT NULL DEFAULT 'regular';

-- identities without a state transition were written by handle_validator,
-- which only ever created masternode owner identities before this migration
UPDATE identities SET type = 'masternode' WHERE state_transition_hash IS NULL;

CREATE INDEX identities_type ON identities(type);
