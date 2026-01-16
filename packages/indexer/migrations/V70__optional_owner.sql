ALTER TABLE state_transitions
DROP INDEX state_transition_owner;

ALTER TABLE state_transitions
DROP COLUMN owner;

ALTER TABLE state_transitions
ADD COLUMN "owner" varchar(44);

CREATE INDEX state_transition_owner ON state_transitions(owner);