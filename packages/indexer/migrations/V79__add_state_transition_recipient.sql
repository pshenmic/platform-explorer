ALTER TABLE state_transitions ADD COLUMN "recipient" varchar(44) NULL;

CREATE INDEX state_transition_recipient ON state_transitions(recipient);