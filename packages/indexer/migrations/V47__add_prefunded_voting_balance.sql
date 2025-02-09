ALTER TABLE documents
ADD COLUMN "prefunded_voting_balance" JSONB DEFAULT null;

CREATE INDEX documents_prefunded_voting_balance_jsonb_path ON documents USING GIN (prefunded_voting_balance jsonb_path_ops);

