use std::collections::BTreeMap;
use std::iter::Rev;
use std::time::SystemTime;
use chrono::{DateTime, Utc};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding;
use dpp::platform_value::Value;
use dpp::prelude::Revision;
use dpp::state_transition::documents_batch_transition::document_base_transition::v0::v0_methods::DocumentBaseTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_create_transition::v0::v0_methods::DocumentCreateTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_delete_transition::v0::v0_methods::DocumentDeleteTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_replace_transition::v0::v0_methods::DocumentReplaceTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_transition::DocumentTransition;
use tokio_postgres::Row;

#[derive(Clone)]
pub struct Document {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub data_contract_identifier: Identifier,
    pub data: Option<BTreeMap<String, Value>>,
    pub deleted: bool,
    pub revision: Revision,
}

impl From<Row> for Document {
    fn from(row: Row) -> Self {
        let id: i32 = row.get(0);

        let identifier_str: String = row.get(1);
        let identifier = Identifier::from_string(&identifier_str, Encoding::Base58).unwrap();

        let data_contract_identifier_str: String = row.get(2);
        let data_contract_identifier = Identifier::from_string(&data_contract_identifier_str, Encoding::Base58).unwrap();

        let revision: i32 = row.get(3);

        let deleted: bool = row.get(4);

        return Document { id: Some(id as u32), deleted, identifier, data: None, data_contract_identifier, revision: Revision::from(revision as u64) };
    }
}

impl From<DocumentTransition> for Document {
    fn from(value: DocumentTransition) -> Self {

        match value {
            DocumentTransition::Create(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision: Revision = Revision::from(0 as u64);

                return Document { id: None, identifier, data: Some(data), data_contract_identifier, revision, deleted: false };
            }
            DocumentTransition::Replace(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision = transition.revision();


                return Document { id: None, identifier, data: Some(data), data_contract_identifier, revision, deleted: false };

            }
            DocumentTransition::Delete(transition) => {
                let base = transition.base().clone();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision: Revision = Revision::from(0 as u64);

                return Document { id: None, identifier, data: None, data_contract_identifier, revision, deleted: true };
            }
        }

    }
}

