CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    identifier varchar(44) NOT NULL,
    revision int NOT NULL,
    "data" jsonb DEFAULT NULL,
    deleted boolean NOT NULL,
    state_transition_hash char(64) NOT NULL references state_transitions(hash),
    data_contract_id int NOT NULL references data_contracts(id)
);

CREATE INDEX documents_data ON documents USING GIN ("data" jsonb_path_ops);
CREATE INDEX idx_documents_state_transition_hash ON documents(state_transition_hash);
