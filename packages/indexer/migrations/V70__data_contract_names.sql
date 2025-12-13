CREATE TABLE data_contract_names (
    id SERIAL PRIMARY KEY,
    name varchar(32) NOT NULL,
    document_identifier varchar(44),
    data_contract_identifier varchar(44) NOT NULL
);

CREATE INDEX idx_data_contract_names_name ON data_contract_names(name);
CREATE INDEX idx_data_contract_names_document_id ON data_contract_names(document_identifier);
CREATE INDEX idx_data_contract_names_data_contract_id ON data_contract_names(data_contract_identifier);
