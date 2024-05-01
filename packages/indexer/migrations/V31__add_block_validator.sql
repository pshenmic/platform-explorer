ALTER TABLE blocks
ADD COLUMN "validator" char(64) NOT NULL references validators(pro_tx_hash);
