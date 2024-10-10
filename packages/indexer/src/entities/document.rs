use dpp::fee::Credits;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::prelude::Revision;
use dpp::state_transition::documents_batch_transition::document_base_transition::v0::v0_methods::DocumentBaseTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_create_transition::v0::v0_methods::DocumentCreateTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_delete_transition::v0::v0_methods::DocumentDeleteTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_replace_transition::v0::v0_methods::DocumentReplaceTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_transition::{DocumentTransition, DocumentTransitionV0Methods};
use dpp::state_transition::documents_batch_transition::document_transition::document_purchase_transition::v0::v0_methods::DocumentPurchaseTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_transition::document_transfer_transition::v0::v0_methods::DocumentTransferTransitionV0Methods;
use dpp::state_transition::documents_batch_transition::document_transition::document_update_price_transition::v0::v0_methods::DocumentUpdatePriceTransitionV0Methods;
use serde_json::Value;
use tokio_postgres::Row;

#[derive(Clone)]
pub struct Document {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub owner: Option<Identifier>,
    pub price: Option<Credits>,
    pub data_contract_identifier: Identifier,
    pub data: Option<Value>,
    pub deleted: bool,
    pub revision: Revision,
    pub is_system: bool,
}

impl From<DocumentTransition> for Document {
    fn from(value: DocumentTransition) -> Self {
        let revision = value.revision();

        match value {
            DocumentTransition::Create(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let data_decoded = serde_json::to_value(data).unwrap();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    price: None,
                    data: Some(data_decoded),
                    data_contract_identifier,
                    revision: revision.unwrap(),
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

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    price: None,
                    data: Some(data_decoded),
                    data_contract_identifier,
                    revision: revision.unwrap(),
                    deleted: false,
                    is_system: false,
                };
            }
            DocumentTransition::Delete(transition) => {
                let base = transition.base().clone();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    price: None,
                    data: None,
                    data_contract_identifier,
                    revision: Revision::from(0 as u64),
                    deleted: true,
                    is_system: false,
                };
            }
            DocumentTransition::Transfer(transition) => {
                let base = transition.base().clone();
                let identifier = base.id();
                let owner = transition.recipient_owner_id();
                let data_contract_identifier = base.data_contract_id();
                let revision = transition.revision();

                return Document {
                    id: None,
                    identifier,
                    owner: Some(owner),
                    price: None,
                    data: None,
                    data_contract_identifier,
                    revision,
                    deleted: true,
                    is_system: false,
                };
            }
            DocumentTransition::UpdatePrice(transition) => {
                let base = transition.base().clone();
                let price = transition.price();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision = transition.revision();

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    price: Some(price),
                    data: None,
                    data_contract_identifier,
                    revision,
                    deleted: true,
                    is_system: false,
                };
            }
            DocumentTransition::Purchase(transition) => {
                let base = transition.base().clone();
                let price = transition.price();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();

                return Document {
                    id: None,
                    identifier,
                    owner: None,
                    price: Some(price),
                    data: None,
                    data_contract_identifier,
                    revision: Revision::from(0 as u64),
                    deleted: true,
                    is_system: false,
                };
            }
        }
    }
}


impl From<Row> for Document {
    fn from(row: Row) -> Self {
        let id: i32 = row.get(0);
        let identifier: String = row.get(1);
        let data_contract_identifier: String = row.get(2);
        let owner: Option<String> = row.get(3);
        let price: Option<i64> = row.get(4);
        let deleted: bool = row.get(5);
        let revision: i32 = row.get(6);
        let is_system: bool = row.get(7);

        return Document {
            id: Some(id as u32),
            owner: owner.map(|e| Identifier::from_string(e.as_str(), Base58).unwrap()),
            price: price.map(|e| Credits::from(e as u64)),
            data_contract_identifier: Identifier::from_string(&data_contract_identifier, Base58).unwrap(),
            data: None,
            deleted,
            identifier: Identifier::from_string(identifier.as_str(), Base58).unwrap(),
            is_system,
            revision: Revision::from(revision as u64),
        }
    }
}
