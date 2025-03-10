use base64::Engine;
use base64::engine::general_purpose;
use data_contracts::SystemDataContract;
use dpp::dashcore::Transaction;
use dpp::identifier::Identifier;
use dpp::identity::state_transition::AssetLockProved;
use dpp::platform_value::string_encoding::Encoding::{Base58, Base64};
use dpp::prelude::{Revision};
use dpp::state_transition::identity_create_transition::accessors::IdentityCreateTransitionAccessorsV0;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_update_transition::accessors::IdentityUpdateTransitionAccessorsV0;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;
use tokio_postgres::Row;
use crate::entities::validator::Validator;

#[derive(Clone)]
pub struct Identity {
    pub identifier: Identifier,
    pub owner: Identifier,
    pub revision: Revision,
    pub balance: Option<u64>,
    pub is_system: bool,
    asset_lock_output_index: Option<u32>
}

impl Identity {
    pub fn set_balance_from_transaction(&mut self, transaction: Transaction) {
        let asset_lock_output_index = self.asset_lock_output_index.unwrap();

        let outpoint = transaction.output
          .iter()
          .nth(asset_lock_output_index as usize)
          .expect("Could not find outpoint by index. Try to set asset lock output index")
          .clone();

        let credits = outpoint.value * 1000;

        self.balance = Some(credits);
    }
}

impl From<IdentityCreateTransition> for Identity {
    fn from(state_transition: IdentityCreateTransition) -> Self {
        let asset_lock = state_transition.asset_lock_proof().clone();
        let asset_lock_output_index = asset_lock.output_index();

        Identity {
            identifier: state_transition.identity_id(),
            owner: state_transition.owner_id(),
            balance: None,
            revision: Revision::from(0 as u64),
            is_system: false,
            asset_lock_output_index: Some(asset_lock_output_index)
        }
    }
}

impl From<IdentityUpdateTransition> for Identity {
    fn from(state_transition: IdentityUpdateTransition) -> Self {
        let identifier = state_transition.identity_id();
        let owner = state_transition.owner_id();
        let revision = state_transition.revision();

        Identity {
            identifier,
            owner,
            balance: None,
            revision,
            is_system: false,
            asset_lock_output_index: None
        }
    }
}

impl From<SystemDataContract> for Identity {
    fn from(data_contract: SystemDataContract) -> Self {
        let platform_version = dpp::version::PLATFORM_VERSIONS.first().unwrap();
        let source = data_contract.source(platform_version).unwrap();
        let identifier = Identifier::from(source.owner_id_bytes);
        let owner = Identifier::from(source.owner_id_bytes);

        Identity {
            identifier,
            owner,
            revision: 0,
            balance: None,
            is_system: true,
            asset_lock_output_index: None
        }
    }
}

impl From<Row> for Identity {
    fn from(row: Row) -> Self {
        let owner: String = row.get(1);
        let identifier: String = row.get(2);
        let revision: i32 = row.get(3);
        let is_system: bool = row.get(4);

        Identity {
            owner: Identifier::from_string(&owner.trim(), Base58).unwrap(),
            revision: Revision::from(revision as u64),
            identifier: Identifier::from_string(&identifier.trim(), Base58).unwrap(),
            is_system,
            balance: None,
            asset_lock_output_index: None
        }
    }
}
impl From<Validator> for Identity {
    fn from(validator: Validator) -> Self {
        let pro_tx_hash_buffer = hex::decode(&validator.pro_tx_hash).unwrap();
        let identifier_string = general_purpose::STANDARD.encode(pro_tx_hash_buffer);
        let identifier = Identifier::from_string(&identifier_string, Base64).unwrap();
        let revision = 0u64;
        let is_system: bool = false;

        Identity {
            owner: identifier,
            revision,
            identifier,
            is_system,
            balance: None,
            asset_lock_output_index: None
        }
    }
}

