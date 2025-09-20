CREATE TABLE token_transitions (
      id SERIAL PRIMARY KEY,
      token_identifier varchar(64) NOT NULL,
      owner varchar(64) NOT NULL,
      action SMALLINT NOT NULL,
      amount bigint,
      public_note varchar(200),
      state_transition_hash char(64) NOT NULL references state_transitions(hash),
      token_contract_position SMALLINT NOT NULL,
      data_contract_id int NOT NULL references data_contracts(id),
      recipient varchar(64)
);