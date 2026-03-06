CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    address varchar(64) NOT NULL,
    bech32m_address varchar(100) NOT NULL
);

CREATE INDEX idx_address ON addresses(address);
CREATE INDEX idx_bech32m_address ON addresses(bech32m_address);
