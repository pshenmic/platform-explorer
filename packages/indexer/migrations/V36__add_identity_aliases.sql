CREATE TABLE identity_aliases (
    id SERIAL PRIMARY KEY,
    identity_identifier varchar(44) NOT NULL,
    alias varchar(64) NOT NULL
);
