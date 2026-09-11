ALTER TABLE blocks ADD COLUMN quorum_hash char(64) NULL;

CREATE INDEX blocks_quorum_hash_idx ON blocks(quorum_hash);
