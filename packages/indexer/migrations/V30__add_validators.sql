CREATE TABLE validators (
    id SERIAL PRIMARY KEY,
    pro_tx_hash char(64) NOT NULL
);

CREATE UNIQUE INDEX validators_protxhash ON validators(pro_tx_hash);
