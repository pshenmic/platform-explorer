CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    amount bigint NOT NULL,
    sender varchar(44),
    recipient varchar(44),
    state_transition_hash char(64) NOT NULL references state_transitions(hash)
);
