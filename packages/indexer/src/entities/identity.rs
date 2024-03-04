use dpp::identifier::Identifier;
use dpp::prelude::Revision;
use dpp::state_transition::identity_create_transition::accessors::IdentityCreateTransitionAccessorsV0;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_update_transition::accessors::IdentityUpdateTransitionAccessorsV0;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;
use dpp::system_data_contracts::SystemDataContract;

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
        return Identity {
            id: None,
            identifier: state_transition.identity_id(),
            owner: state_transition.owner_id(),
            balance: None,
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

