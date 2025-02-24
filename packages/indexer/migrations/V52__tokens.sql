CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    position SMALLINT NOT NULL,
    identifier varchar(64) NOT NULL,
    data_contract_id int NOT NULL references data_contracts(id),
    maxSupply bigint DEFAULT NULL,
    baseSupply bigint not null,
    keeps_history BOOLEAN not null,
    distribution_rules jsonb DEFAULT NULL,
    manual_minting_rules jsonb DEFAULT NULL,
    manual_burning_rules jsonb DEFAULT NULL,
    freeze_rules jsonb DEFAULT NULL,
    unfreeze_rules jsonb DEFAULT NULL,
    destroy_frozen_funds_rules jsonb DEFAULT NULL,
    emergency_action_rules jsonb DEFAULT NULL
);