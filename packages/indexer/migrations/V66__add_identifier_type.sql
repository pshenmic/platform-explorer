ALTER TABLE identities
ADD COLUMN "type" varchar(16) not null;

CREATE INDEX idx_identity_type ON identities(type)
