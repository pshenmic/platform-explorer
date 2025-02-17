CREATE TABLE identity_aliases (
    id SERIAL PRIMARY KEY,
    identity_identifier varchar(44) NOT NULL,
    alias varchar(64) NOT NULL
);

CREATE UNIQUE INDEX identity_aliases_alias ON identity_aliases(alias);
CREATE INDEX identity_aliases_identifier ON identity_aliases(identity_identifier);
