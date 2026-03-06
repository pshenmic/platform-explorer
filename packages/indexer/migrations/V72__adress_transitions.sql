CREATE TABLE address_transitions (
    id SERIAL PRIMARY KEY,
    sender_id int references addresses(id),
    recipient_id int references addresses(id),
    state_transition_id int not null references state_transitions(id),
    transition_type int not null
);

CREATE INDEX idx_addresses_transitions_sender_id ON address_transitions(sender_id);
CREATE INDEX idx_addresses_transitions_recipient_id ON address_transitions(recipient_id);
CREATE INDEX idx_addresses_transitions_transition_id ON address_transitions(state_transition_id);
CREATE INDEX idx_addresses_transitions_transition_type ON address_transitions(transition_type);
