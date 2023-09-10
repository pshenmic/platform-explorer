pub mod psql;

use async_trait::async_trait;

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

#[async_trait]
pub trait STProcessorHandlerSet {
    async fn handle_data_contract_create(&self, state_transition: DataContractCreateTransition) -> bool;
}
