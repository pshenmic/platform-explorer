use dpp::state_transition::StateTransition;
use crate::processor::{STProcessorLike, STProcessorType};

mod handlers;

pub struct PSQLProcessor {

}

impl STProcessorLike<PSQLProcessor> for PSQLProcessor {
    fn handle(state_transition: StateTransition) -> () {
        match state_transition {
            StateTransition::DataContractCreate(_) => {},
            StateTransition::DataContractUpdate(_) => {}
            StateTransition::DocumentsBatch(_) => {}
            StateTransition::IdentityCreate(_) => {}
            StateTransition::IdentityTopUp(_) => {}
            StateTransition::IdentityCreditWithdrawal(_) => {}
            StateTransition::IdentityUpdate(_) => {}
            StateTransition::IdentityCreditTransfer(_) => {}
        }
    }
}

