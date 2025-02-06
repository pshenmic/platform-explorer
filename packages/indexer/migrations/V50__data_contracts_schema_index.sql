CREATE INDEX data_contracts_schema ON data_contracts USING GIN (schema jsonb_path_ops);
