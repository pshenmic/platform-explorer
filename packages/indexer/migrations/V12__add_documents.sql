CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    identifier char(44) NOT NULL
    revision int NOT NULL
    "data" jsonb NOT NULL
    state_transition_hash int NOT NULL references state_transitions(hash),
    data_contract_identifier int NOT NULL references data_contracts(identifier),
    CONSTRAINT identifier UNIQUE(identifier)
);

CREATE INDEX documents_identifier ON documents(identifier);
