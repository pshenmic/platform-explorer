ALTER TABLE data_contracts
ADD COLUMN "keywords" TEXT[] NOT NULL;

CREATE INDEX idx_data_contract_keywords ON data_contracts(keywords)