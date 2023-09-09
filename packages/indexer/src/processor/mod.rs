mod psql;

use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use dpp::state_transition::StateTransition;
use crate::processor::psql::PSQLProcessor;


pub enum STProcessorType {
    PSQL,
}

pub trait STProcessorLike<T> {
    fn handle(state_transition: StateTransition) -> ();
}

pub trait STProcessorHandlerSet {
    fn handle_data_contract_create(state_transition: DataContractCreateTransition) -> ();
}
