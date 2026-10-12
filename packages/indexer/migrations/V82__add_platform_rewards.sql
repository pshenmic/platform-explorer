-- amount is what the masternode was paid in credits for the blocks it proposed in the epoch,
-- before the masternode reward shares, block_height is the block that paid it
CREATE TABLE platform_rewards (
    id SERIAL PRIMARY KEY,
    block_height int NOT NULL,
    epoch int NOT NULL,
    pro_tx_hash char(64) NOT NULL,
    amount bigint NOT NULL
);

CREATE INDEX platform_rewards_pro_tx_hash ON platform_rewards(pro_tx_hash, block_height);
CREATE INDEX platform_rewards_epoch ON platform_rewards(epoch);
