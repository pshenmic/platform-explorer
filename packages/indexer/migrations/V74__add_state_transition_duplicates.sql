CREATE TABLE state_transition_duplicates (
    id SERIAL PRIMARY KEY,
    hash char(64) NOT NULL,
    block_hash char(64) NOT NULL
);

INSERT INTO state_transition_duplicates (hash, block_hash)
VALUES
    ('1ba0895d9785eff87f0d69d1a7bc22b54e73d267fae3d14513af5c56358b42a5', '9efa730c41ce9408f9732e4c72a4dae7a2701af0f7b1dce8a72f163e285bebf3'),
    ('e2d274c484eceaba06864d537367e550bd278c09cb783ace45b999b92b02f8ef', '9efa730c41ce9408f9732e4c72a4dae7a2701af0f7b1dce8a72f163e285bebf3'),
    ('cf285c01204a6811a06b4b60f599870fffd77f2ceafd771c2608ed56a4454ca0', 'f72dd58af03236502b13cefa918bc13089a689b4cd06dbd44bbe277d1a77e0ab'),
    ('9be24f6636e70d288c82a37c6b6ff9622e8f3f7c2b6dccb44d005305febeadad', 'f72dd58af03236502b13cefa918bc13089a689b4cd06dbd44bbe277d1a77e0ab'),
    ('90acb14d5e1d8807c96979e2f331f9efbfcef33133fd71c0841211d65bafdb6e', 'afdcdba8ee9d612cebb3bc9d3d2e8c01e6334c772d555c66316b50970e22b92c');

CREATE INDEX state_transition_duplicates_hash ON state_transition_duplicates (hash);
CREATE INDEX state_transition_duplicates_block_hash ON state_transition_duplicates (block_hash);