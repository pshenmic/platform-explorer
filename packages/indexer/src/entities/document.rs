use dpp::identifier::Identifier;
use dpp::prelude::Revision;
use dpp::state_transition::documents_batch_transition::document_base_transition::v0::v0_methods::DocumentBaseTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_create_transition::v0::v0_methods::DocumentCreateTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_delete_transition::v0::v0_methods::DocumentDeleteTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_replace_transition::v0::v0_methods::DocumentReplaceTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_transition::DocumentTransition;
use serde_json::Value;

#[derive(Clone)]
pub struct Document {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub owner: Option<Identifier>,
    pub data_contract_identifier: Identifier,
    pub data: Option<Value>,
    pub deleted: bool,
    pub revision: Revision,
    pub is_system: bool
}

impl From<DocumentTransition> for Document {
    fn from(value: DocumentTransition) -> Self {
        match value {
            DocumentTransition::Create(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let data_decoded = serde_json::to_value(data).unwrap();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision: Revision = Revision::from(0 as u64);

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    data: Some(data_decoded),
                    data_contract_identifier,
                    revision,
                    deleted: false,
                    is_system: false,
                };
            }
            DocumentTransition::Replace(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let data_decoded = serde_json::to_value(data).unwrap();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision = transition.revision();

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    data: Some(data_decoded),
                    data_contract_identifier,
                    revision,
                    deleted: false,
                    is_system: false,
                };
            }
            DocumentTransition::Delete(transition) => {
                let base = transition.base().clone();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision: Revision = Revision::from(0 as u64);

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    data: None,
                    data_contract_identifier,
                    revision,
                    deleted: true,
                    is_system: false,
                };
            }
        }
    }
}

