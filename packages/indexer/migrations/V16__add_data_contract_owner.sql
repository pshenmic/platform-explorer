ALTER TABLE data_contracts
ADD COLUMN "state_transition_hash" char(64) not null;

ALTER TABLE data_contracts
ADD COLUMN "owner" char(44) not null;
