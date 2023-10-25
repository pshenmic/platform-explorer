CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    amount bigint NOT NULL,
    sender char(44),
    recipient char(44),
    state_transition_hash char(64) NOT NULL references state_transitions(hash)
);
