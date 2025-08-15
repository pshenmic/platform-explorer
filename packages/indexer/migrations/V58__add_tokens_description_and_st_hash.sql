ALTER TABLE tokens
ADD COLUMN "description" text,
ADD COLUMN "state_transition_hash" char(64);