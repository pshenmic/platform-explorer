ALTER TABLE data_contracts
ADD COLUMN "description" TEXT;

CREATE INDEX idx_data_contract_description ON data_contracts(description)