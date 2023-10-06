CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    identifier char(44) NOT NULL,
    revision int NOT NULL,
    "data" jsonb DEFAULT NULL,
    deleted boolean NOT NULL,
    state_transition_hash char(64) NOT NULL references state_transitions(hash),
    data_contract_identifier char(44) NOT NULL references data_contracts(identifier),
    UNIQUE(state_transition_hash)
);
