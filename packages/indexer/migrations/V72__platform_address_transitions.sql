CREATE TABLE platform_address_transitions (
    id SERIAL PRIMARY KEY,
    sender_id int references platform_addresses(id),
    recipient_id int references platform_addresses(id),
    state_transition_id int not null references state_transitions(id),
    state_transition_type int not null
);

CREATE INDEX idx_platform_addresses_transitions_sender_id ON platform_address_transitions(sender_id);
CREATE INDEX idx_platform_addresses_transitions_recipient_id ON platform_address_transitions(recipient_id);
CREATE INDEX idx_platform_addresses_transitions_transition_id ON platform_address_transitions(state_transition_id);
CREATE INDEX idx_platform_addresses_transitions_transition_type ON platform_address_transitions(state_transition_type);
