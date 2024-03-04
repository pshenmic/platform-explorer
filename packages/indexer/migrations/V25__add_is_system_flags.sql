ALTER TABLE identities
ADD COLUMN "is_system" boolean not null;

ALTER TABLE data_contracts
ADD COLUMN "is_system" boolean not null;

ALTER TABLE documents
ADD COLUMN "is_system" boolean not null;