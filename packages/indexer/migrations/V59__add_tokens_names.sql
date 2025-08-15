ALTER TABLE tokens
ADD COLUMN "name" text;

CREATE INDEX idx_token_name ON tokens(name)
