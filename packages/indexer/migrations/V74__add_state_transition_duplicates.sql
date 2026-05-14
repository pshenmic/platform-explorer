CREATE TABLE state_transition_duplicates (
    id SERIAL PRIMARY KEY,
    hash char(64) NOT NULL,
    block_hash char(64) NOT NULL
);

CREATE INDEX state_transition_duplicates_hash ON state_transition_duplicates (hash);
CREATE INDEX state_transition_duplicates_block_hash ON state_transition_duplicates (block_hash);