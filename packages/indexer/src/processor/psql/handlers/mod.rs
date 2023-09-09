use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use dpp::state_transition::StateTransition;
use dpp::state_transition::StateTransition::DataContractCreate;
use crate::processor::psql::PSQLProcessor;
use crate::processor::STProcessorHandlerSet;

pub struct PSQLProcessorHandlers {
}

impl STProcessorHandlerSet for PSQLProcessorHandlers {
    fn handle_data_contract_create(state_transition: DataContractCreateTransition) -> () {
        // create new data contract in the database
    }
}
