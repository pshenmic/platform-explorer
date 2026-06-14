ALTER TABLE identities
ADD COLUMN "state_transition_id" int references state_transitions(id);

CREATE INDEX idx_state_transition_id ON identities(state_transition_id)
