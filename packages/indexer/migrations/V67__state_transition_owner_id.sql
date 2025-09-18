ALTER TABLE state_transitions
ADD COLUMN "owner_id" int not null;

CREATE INDEX idx_owner_id ON state_transitions(owner_id);
