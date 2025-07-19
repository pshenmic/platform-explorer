CREATE TABLE masternode_votes (
    id SERIAL PRIMARY KEY,
    power SMALLINT NOT NULL,
    pro_tx_hash char(64) NOT NULL,
    state_transition_hash char(64) NOT NULL references state_transitions(hash),
    voter_identity_id varchar(64) NOT NULL,
    choice SMALLINT NOT NULL,
    towards_identity_identifier varchar(44) DEFAULT NULL,
    data_contract_id int NOT NULL references data_contracts(id),
    document_type_name char(64) NOT NULL,
    index_name char(64) NOT NULL,
    index_values JSONB NOT NULL
);

CREATE INDEX masternode_votes_towards_identity_identifier ON masternode_votes(towards_identity_identifier);
CREATE INDEX masternode_votes_index_values ON masternode_votes USING GIN (index_values jsonb_path_ops);
CREATE INDEX masternode_towards_choice ON masternode_votes (towards_identity_identifier, choice);
CREATE INDEX masternode_choice ON masternode_votes (choice);
CREATE INDEX masternode_power ON masternode_votes (power);
