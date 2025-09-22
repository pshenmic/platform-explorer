ALTER TABLE identities
ADD COLUMN "type" varchar(16) not null;
ALTER TABLE identities
ADD COLUMN "voting_key_purpose" varchar(16);

CREATE INDEX idx_identity_type ON identities(type);
CREATE INDEX idx_identity_voting_key_purpose ON identities(voting_key_purpose);
