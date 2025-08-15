CREATE TABLE token_holders (
    id SERIAL PRIMARY KEY,
    token_id int NOT NULL references tokens(id),
    holder varchar(64) NOT NULL
);

CREATE INDEX idx_holder ON token_holders (holder);
CREATE INDEX idx_token_id ON token_holders (token_id);
