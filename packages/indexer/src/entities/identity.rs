use data_contracts::SystemDataContract;
use dpp::identifier::Identifier;
use dpp::identity::state_transition::AssetLockProved;
use dpp::prelude::Revision;
use dpp::state_transition::identity_create_transition::accessors::IdentityCreateTransitionAccessorsV0;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_update_transition::accessors::IdentityUpdateTransitionAccessorsV0;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;

#[derive(Clone)]
pub struct Identity {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub owner: Identifier,
    pub revision: Revision,
    pub balance: Option<u64>,
    pub is_system: bool
}

impl From<IdentityCreateTransition> for Identity {
    fn from(state_transition: IdentityCreateTransition) -> Self {
        let asset_lock = state_transition.asset_lock_proof().clone();
        let asset_lock_output_index = asset_lock.output_index();

        let tx_option = asset_lock.transaction().clone();

        let future = match tx_option {
            None => Err("Transaction not found"),
            Some(tx) => Ok(tx.clone()),
        };

        let transaction = future.expect("Could not get transaction from the future");

        let outpoint = transaction.output.iter().nth(asset_lock_output_index as usize).expect("Could not find outpoint by index").clone();

        let credits = outpoint.value * 1000;

        return Identity {
            id: None,
            identifier: state_transition.identity_id(),
            owner: state_transition.owner_id(),
            balance: Some(credits),
            revision: Revision::from(0 as u64),
            is_system: false,
        };
    }
}

impl From<IdentityUpdateTransition> for Identity {
    fn from(state_transition: IdentityUpdateTransition) -> Self {
        let identifier = state_transition.identity_id();
        let owner = state_transition.owner_id();
        let revision = state_transition.revision();

        return Identity {
            id: None,
            identifier,
            owner,
            balance: None,
            revision,
            is_system: false,
        };
    }
}

impl From<SystemDataContract> for Identity {
    fn from(data_contract: SystemDataContract) -> Self {
        let platform_version = dpp::version::PLATFORM_VERSIONS.first().unwrap();
        let source = data_contract.source(platform_version).unwrap();
        let identifier = Identifier::from(source.owner_id_bytes);
        let owner = Identifier::from(source.owner_id_bytes);

        return Identity {
            id: None,
            identifier,
            owner,
            revision: 0,
            balance: None,
            is_system: true,
        }
    }
}

