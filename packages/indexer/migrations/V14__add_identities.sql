CREATE TABLE identities (
    id SERIAL PRIMARY KEY,
    identifier varchar(44) NOT NULL,
    revision int NOT NULL,
    state_transition_hash char(64) NOT NULL references state_transitions(hash)
);
