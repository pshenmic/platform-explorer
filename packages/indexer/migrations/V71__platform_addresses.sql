CREATE TABLE platform_addresses (
    id SERIAL PRIMARY KEY,
    address varchar(64) NOT NULL,
    bech32m_address varchar(100) NOT NULL
);

CREATE INDEX idx_platform_addresses_address ON platform_addresses(address);
CREATE INDEX idx_platform_addresses_bech32m_address ON platform_addresses(bech32m_address);
