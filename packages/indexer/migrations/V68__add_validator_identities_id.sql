ALTER TABLE validators
ADD COLUMN "voting_identity_id" int not null REFERENCES identities(id);
ALTER TABLE validators
ADD COLUMN "masternode_identity_id" int not null REFERENCES identities(id);

CREATE INDEX idx_validators_voting_identity_id_id ON validators(voting_identity_id);
CREATE INDEX idx_validators_masternode_identity_id ON validators(masternode_identity_id);
