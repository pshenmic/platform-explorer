use dpp::identifier::Identifier;
use dpp::prelude::Revision;
use dpp::state_transition::identity_create_transition::accessors::IdentityCreateTransitionAccessorsV0;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_update_transition::accessors::IdentityUpdateTransitionAccessorsV0;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;

#[derive(Clone)]
pub struct Identity {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub revision: Revision,
    pub balance: Option<u64>,
}
//
// impl From<Row> for Identity {
//     fn from(row: Row) -> Self {
//         let id: u32 = row.get(0);
//
//         let balance:u64 = row.get(1);
//
//         let identifier_str: String = row.get(1);
//         let identifier = Identifier::from_string(&identifier_str, Encoding::Base58).unwrap();
//
//         let revision: i32 = row.get(3);
//
//         return Identity {
//             id: Some(id),
//             identifier,
//             balance,
//             revision: Revision::from(revision as u64)
//         };
//     }
// }

impl From<IdentityCreateTransition> for Identity {
    fn from(state_transition: IdentityCreateTransition) -> Self {
        return Identity {
            id: None,
            identifier: state_transition.identity_id(),
            balance: None,
            revision: Revision::from(0 as u64),
        };
    }
}

impl From<IdentityUpdateTransition> for Identity {
    fn from(state_transition: IdentityUpdateTransition) -> Self {
        let identifier = state_transition.identity_id();
        let revision = state_transition.revision();

        return Identity {
            id: None,
            identifier,
            balance: None,
            revision,
        };
    }
}

