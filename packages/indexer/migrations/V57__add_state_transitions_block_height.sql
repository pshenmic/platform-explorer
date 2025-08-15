ALTER TABLE state_transitions
ADD COLUMN "block_height" int not null;

CREATE INDEX idx_block_height ON state_transitions(block_height)
