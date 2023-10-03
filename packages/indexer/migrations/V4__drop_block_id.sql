ALTER TABLE state_transitions
DROP CONSTRAINT state_transitions_block_id_fkey;

ALTER TABLE state_transitions
DROP COLUMN block_id;

ALTER TABLE blocks
DROP COLUMN id;

ALTER TABLE state_transitions
ADD COLUMN block_hash char(64) NOT NULL
CONSTRAINT state_transitions_block_hash_fkey REFERENCES blocks(hash)
ON UPDATE RESTRICT ON DELETE RESTRICT;
