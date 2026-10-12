-- amount is what the masternode received in duffs, without the Platform credit pool output
CREATE TABLE core_payments (
    id SERIAL PRIMARY KEY,
    core_block_height int NOT NULL,
    pro_tx_hash char(64) NOT NULL,
    amount bigint NOT NULL
);

CREATE INDEX core_payments_pro_tx_hash ON core_payments(pro_tx_hash, core_block_height);
CREATE INDEX core_payments_core_block_height ON core_payments(core_block_height);
