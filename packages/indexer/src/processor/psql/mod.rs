use std::ops::DerefMut;
use dpp::state_transition::StateTransition;
use crate::processor::{STProcessorHandlerSet, STProcessorLike, STProcessorType};
use deadpool_postgres::{Config, Manager, ManagerConfig, Pool, RecyclingMethod, Runtime, tokio_postgres};
use deadpool_postgres::tokio_postgres::{Error, NoTls, Row};
use dpp::dashcore::bech32::ToBase32;
use dpp::platform_value::string_encoding::Encoding;
use dpp::state_transition::data_contract_create_transition::accessors::DataContractCreateTransitionAccessorsV0;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;

pub struct PSQLProcessor {
    connection_pool: Pool,
}


impl PSQLProcessor {
    pub fn new() -> PSQLProcessor {
        let mut cfg = Config::new();

        cfg.host = Some("172.17.0.1".to_string());
        cfg.dbname = Some("indexer".to_string());
        cfg.user = Some("indexer".to_string());
        cfg.password = Some("indexer".to_string());
        cfg.manager = Some(ManagerConfig { recycling_method: RecyclingMethod::Fast });

        let connection_pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls).unwrap();

        return PSQLProcessor { connection_pool };
    }

    pub async fn handle_data_contract_create(&self, state_transition: DataContractCreateTransition) -> () {
        let client = self.connection_pool.get().await.unwrap();

        let id = state_transition.data_contract().id();
        let id_str = id.to_string(Encoding::Base58);

        let stmt = client.prepare_cached("INSERT INTO data_contracts(identifier) VALUES ($1);").await.unwrap();

        client.query(&stmt, &[&id_str]).await.unwrap();
    }
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

