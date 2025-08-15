use crate::entities::data_contract::DataContract;
use crate::processor::psql::PSQLProcessor;
use deadpool_postgres::Transaction;
use dpp::prelude::Identifier;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;

impl PSQLProcessor {
    pub async fn handle_data_contract_create(
        &self,
        state_transition: DataContractCreateTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao
            .create_data_contract(
                data_contract.clone(),
                Some(st_hash.clone()),
                sql_transaction,
            )
            .await;

        self.handle_token_configuration(
            data_contract.clone(),
            Some(st_hash.clone()),
            sql_transaction,
        )
        .await;

        self.handle_data_contract_transition(
            Some(st_hash.clone()),
            data_contract.identifier,
            sql_transaction,
        )
        .await;
    }

    pub async fn handle_data_contract_update(
        &self,
        state_transition: DataContractUpdateTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao
            .create_data_contract(
                data_contract.clone(),
                Some(st_hash.clone()),
                sql_transaction,
            )
            .await;

        self.handle_token_configuration(data_contract.clone(), None, sql_transaction)
            .await;

        self.handle_data_contract_transition(
            Some(st_hash.clone()),
            data_contract.identifier,
            sql_transaction,
        )
        .await;
    }

    pub async fn handle_data_contract_transition(
        &self,
        state_transition_hash: Option<String>,
        data_contract_identifier: Identifier,
        sql_transaction: &Transaction<'_>,
    ) {
        let id = match state_transition_hash {
            None => None,
            Some(st_hash) => Some(
                self.dao
                    .get_state_transition_id(st_hash.clone(), sql_transaction)
                    .await
                    .expect("Error getting state_transition_id"),
            ),
        };

        let data_contract = self
            .dao
            .get_data_contract_by_identifier(data_contract_identifier, sql_transaction)
            .await
            .expect("Error getting parent_contract")
            .unwrap();

        self.dao
            .create_data_contract_transition(
                data_contract.id.clone().unwrap(),
                data_contract.identifier,
                id,
                sql_transaction,
            )
            .await;
    }
}
