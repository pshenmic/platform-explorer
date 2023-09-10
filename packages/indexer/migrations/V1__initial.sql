CREATE TABLE data_contracts (
    id SERIAL PRIMARY KEY,
    identifier varchar(255),
    CONSTRAINT production UNIQUE(identifier)
);
