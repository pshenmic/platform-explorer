CREATE TABLE data_contract_transitions (
    id SERIAL PRIMARY KEY,
    data_contract_id int NOT NULL references data_contracts(id),
    data_contract_identifier varchr(44) references data_contracts(identifier),
);