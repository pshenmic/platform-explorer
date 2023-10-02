CREATE TABLE data_contracts (
    id SERIAL PRIMARY KEY,
    identifier varchar(255),
    CONSTRAINT identifier_unique UNIQUE(identifier)
);

CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    hash char(64) NOT NULL,
    block_height int NOT NULL check(block_height > 0),
    CONSTRAINT block_hash UNIQUE(hash)
);

CREATE TABLE state_transitions (
    id SERIAL PRIMARY KEY,
    hash char(64) NOT NULL,
    data TEXT NOT NULL,
    type int NOT NULL,
    block_id int NOT NULL references blocks(id),
    CONSTRAINT state_transition_hash UNIQUE(hash)
);
