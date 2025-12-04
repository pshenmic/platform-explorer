CREATE INDEX idx_document_n_contract_revision ON documents(data_contract_id, revision);
CREATE INDEX idx_documents_rev_owner_count ON documents (revision, owner);
