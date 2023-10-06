ALTER TABLE data_contracts
DROP CONSTRAINT identifier_unique;

ALTER TABLE data_contracts
ADD COLUMN "version" int not null;

CREATE INDEX data_contract_id_identifier ON data_contracts(id,identifier);
