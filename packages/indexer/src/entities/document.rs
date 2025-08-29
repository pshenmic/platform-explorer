use dpp::fee::Credits;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::prelude::Revision;
use dpp::state_transition::batch_transition::batched_transition::document_transition::DocumentTransition;
use dpp::state_transition::batch_transition::batched_transition::document_transition::DocumentTransitionV0Methods;
use dpp::state_transition::batch_transition::document_base_transition::v0::v0_methods::DocumentBaseTransitionV0Methods;
use dpp::state_transition::batch_transition::document_create_transition::v0::v0_methods::DocumentCreateTransitionV0Methods;
// use dpp::state_transition::batch_transition::document_delete_transition::v0::v0_methods;
use dpp::state_transition::batch_transition::document_replace_transition::v0::v0_methods::DocumentReplaceTransitionV0Methods;
use dpp::state_transition::batch_transition::batched_transition::document_transition_action_type::{DocumentTransitionActionType, DocumentTransitionActionTypeGetter};
use dpp::state_transition::batch_transition::batched_transition::document_purchase_transition::v0::v0_methods::DocumentPurchaseTransitionV0Methods;
use dpp::state_transition::batch_transition::batched_transition::document_transfer_transition::v0::v0_methods::DocumentTransferTransitionV0Methods;
use dpp::state_transition::batch_transition::batched_transition::document_update_price_transition::v0::v0_methods::DocumentUpdatePriceTransitionV0Methods;
use dpp::state_transition::batch_transition::document_base_transition::document_base_transition_trait::DocumentBaseTransitionAccessors;
use serde_json::Value;
use tokio_postgres::Row;

#[derive(Clone)]
pub struct Document {
    pub identifier: Identifier,
    pub document_type_name: String,
    pub transition_type: DocumentTransitionActionType,
    pub owner: Option<Identifier>,
    pub price: Option<Credits>,
    pub data_contract_identifier: Identifier,
    pub data: Option<Value>,
    pub deleted: bool,
    pub revision: Revision,
    pub is_system: bool,
    pub prefunded_voting_balance: Option<(String, Credits)>,
}

impl From<DocumentTransition> for Document {
    fn from(value: DocumentTransition) -> Self {
        let revision = value.revision();
        let transition_type = value.action_type();

        match value {
            DocumentTransition::Create(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let data_decoded = serde_json::to_value(data).unwrap();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let document_type_name = base.document_type_name().clone();
                let prefunded_voting_balance = transition.prefunded_voting_balance().clone();

                Document {
                    identifier,
                    document_type_name,
                    transition_type,
                    owner: None,
                    price: None,
                    data: Some(data_decoded),
                    data_contract_identifier,
                    revision: revision.unwrap(),
                    deleted: false,
                    is_system: false,
                    prefunded_voting_balance,
                }
            }
            DocumentTransition::Replace(transition) => {
                let base = transition.base().clone();
                let data = transition.data().clone();
                let data_decoded = serde_json::to_value(data).unwrap();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let document_type_name = base.document_type_name().clone();

                Document {
                    identifier,
                    document_type_name,
                    transition_type,
                    owner: None,
                    price: None,
                    data: Some(data_decoded),
                    data_contract_identifier,
                    revision: revision.unwrap(),
                    deleted: false,
                    is_system: false,
                    prefunded_voting_balance: None,
                }
            }
            DocumentTransition::Delete(transition) => {
                let base = transition.base().clone();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let document_type_name = base.document_type_name().clone();

                Document {
                    identifier,
                    document_type_name,
                    transition_type,
                    owner: None,
                    price: None,
                    data: None,
                    data_contract_identifier,
                    revision: Revision::from(0 as u64),
                    deleted: true,
                    is_system: false,
                    prefunded_voting_balance: None,
                }
            }
            DocumentTransition::Transfer(transition) => {
                let base = transition.base().clone();
                let identifier = base.id();
                let owner = transition.recipient_owner_id();
                let data_contract_identifier = base.data_contract_id();
                let revision = transition.revision();
                let document_type_name = base.document_type_name().clone();

                Document {
                    identifier,
                    document_type_name,
                    transition_type,
                    owner: Some(owner),
                    price: None,
                    data: None,
                    data_contract_identifier,
                    revision,
                    deleted: false,
                    is_system: false,
                    prefunded_voting_balance: None,
                }
            }
            DocumentTransition::UpdatePrice(transition) => {
                let base = transition.base().clone();
                let price = transition.price();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let revision = transition.revision();
                let document_type_name = base.document_type_name().clone();

                Document {
                    identifier,
                    document_type_name,
                    transition_type,
                    owner: None,
                    price: Some(price),
                    data: None,
                    data_contract_identifier,
                    revision,
                    deleted: false,
                    is_system: false,
                    prefunded_voting_balance: None,
                }
            }
            DocumentTransition::Purchase(transition) => {
                let base = transition.base().clone();
                let price = transition.price();
                let revision = transition.revision();
                let identifier = base.id();
                let data_contract_identifier = base.data_contract_id();
                let document_type_name = base.document_type_name().clone();

                Document {
                    identifier,
                    document_type_name,
                    transition_type,
                    owner: None,
                    price: Some(price),
                    data: None,
                    data_contract_identifier,
                    revision,
                    deleted: false,
                    is_system: false,
                    prefunded_voting_balance: None,
                }
            }
        }
    }
}

impl From<Row> for Document {
    fn from(row: Row) -> Self {
        let identifier: String = row.get(1);
        let document_type_name: String = row.get(2);
        let transition_type_i64: i64 = row.get(3);
        let data_contract_identifier: String = row.get(4);
        let owner: Option<String> = row.get(5);
        let price: Option<i64> = row.get(6);
        let deleted: bool = row.get(7);
        let revision: i32 = row.get(8);
        let is_system: bool = row.get(9);
        let prefunded_voting_balance: Option<Value> = row.get(10);

        let transition_type = match transition_type_i64 {
            0 => DocumentTransitionActionType::Create,
            1 => DocumentTransitionActionType::Replace,
            2 => DocumentTransitionActionType::Delete,
            3 => DocumentTransitionActionType::Transfer,
            4 => DocumentTransitionActionType::Purchase,
            5 => DocumentTransitionActionType::UpdatePrice,
            _ => panic!("Unknown document transition type"),
        };

        Document {
            owner: owner.map(|e| Identifier::from_string(e.as_str(), Base58).unwrap()),
            price: price.map(|e| Credits::from(e as u64)),
            data_contract_identifier: Identifier::from_string(&data_contract_identifier, Base58)
                .unwrap(),
            data: None,
            deleted,
            identifier: Identifier::from_string(identifier.as_str(), Base58).unwrap(),
            document_type_name,
            is_system,
            revision: Revision::from(revision as u64),
            transition_type: DocumentTransitionActionType::try_from(transition_type).unwrap(),
            prefunded_voting_balance: prefunded_voting_balance.map(|value| {
                let test = value.as_object().unwrap();

                let (index_name, credits) = test.iter().nth(0).unwrap();

                (index_name.to_string(), credits.as_u64().unwrap())
            }),
        }
    }
}
