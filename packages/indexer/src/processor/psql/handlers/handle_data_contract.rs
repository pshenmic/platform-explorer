use deadpool_postgres::Transaction;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use crate::entities::data_contract::DataContract;
use crate::processor::psql::PSQLProcessor;

impl PSQLProcessor {
  pub async fn handle_data_contract_create(&self, state_transition: DataContractCreateTransition, st_hash: String, sql_transaction: &Transaction<'_>) -> () {
    let data_contract = DataContract::from(state_transition);

    self.dao.create_data_contract(data_contract, Some(st_hash), sql_transaction).await;
  }

  pub async fn handle_data_contract_update(&self, state_transition: DataContractUpdateTransition, st_hash: String, sql_transaction: &Transaction<'_>) -> () {
    let data_contract = DataContract::from(state_transition);

    self.dao.create_data_contract(data_contract, Some(st_hash), sql_transaction).await;
  }
}