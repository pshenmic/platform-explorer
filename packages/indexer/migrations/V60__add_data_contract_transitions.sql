CREATE TABLE data_contract_transitions (
    id SERIAL PRIMARY KEY,
    data_contract_id int NOT NULL references data_contracts(id),
    data_contract_identifier varchar(44),
    state_transition_id int references state_transitions(id)
);

CREATE INDEX idx_data_contract_identifier ON data_contract_transitions(data_contract_identifier);
