ALTER TABLE documents
DROP COLUMN owner;

ALTER TABLE data_contracts
DROP COLUMN owner;

ALTER TABLE state_transitions
ADD COLUMN "owner" char(44) not null;
