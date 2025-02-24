CREATE TABLE tokens_transitions (
      id SERIAL PRIMARY KEY,
      owner varchar(64) NOT NULL,
      action SMALLINT NOT NULL,
      amount int,
      public_note char(64),
      state_transition_hash char(64) NOT NULL references state_transitions(hash),
      token_contract_position SMALLINT NOT NULL,
      data_contract_id int NOT NULL references data_contracts(id),
      recipient varchar(64)
);