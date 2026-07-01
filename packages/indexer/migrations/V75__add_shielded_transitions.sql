CREATE TABLE shielded_transitions(
    id SERIAL PRIMARY KEY,
    state_transition_id int not null references state_transitions(id),
    state_transition_type int not null,
    amount bigint not null
);

CREATE INDEX shielded_state_transition_id_idx ON shielded_transitions(state_transition_id);
CREATE INDEX shielded_transition_type_idx ON shielded_transitions(state_transition_type);