mod dao;

use crate::decoder::decoder::StateTransitionDecoder;
use crate::entities::data_contract::DataContract;
use crate::entities::document::Document;
use crate::processor::psql::dao::PostgresDAO;
use dashcore_rpc::Client;
use data_contracts::SystemDataContract;
use deadpool_postgres::{PoolError, Transaction};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::platform_value::{platform_value, BinaryData};
use dpp::state_transition::state_transitions::batch_transition::batched_transition::document_transition_action_type::DocumentTransitionActionType;
use std::env;
use std::num::ParseIntError;
use redis::Commands;

pub mod handlers;

#[derive(Debug)]
pub enum ProcessorError {
    DatabaseError,
    TenderdashTxResultNotExists,
    UnexpectedError,
}

impl From<PoolError> for ProcessorError {
    fn from(value: PoolError) -> Self {
        println!("{}", value);
        ProcessorError::DatabaseError
    }
}

impl From<reqwest::Error> for ProcessorError {
    fn from(value: reqwest::Error) -> Self {
        println!("{}", value);
        ProcessorError::UnexpectedError
    }
}

impl From<ParseIntError> for ProcessorError {
    fn from(value: ParseIntError) -> Self {
        println!("{}", value);
        ProcessorError::UnexpectedError
    }
}

pub struct PSQLProcessor {
    decoder: StateTransitionDecoder,
    dao: PostgresDAO,
    platform_explorer_identifier: Identifier,
    dashcore_rpc: Client,
    redis: Option<redis::Connection>,
    redis_pubsub_new_block_channel: Option<String>,
}

impl PSQLProcessor {
    pub fn new(
        dashcore_rpc: Client,
        redis: Option<redis::Connection>,
        redis_pubsub_new_block_channel: Option<String>,
    ) -> PSQLProcessor {
        let dao = PostgresDAO::new();
        let decoder = StateTransitionDecoder::new();
        let platform_explorer_identifier_string: String =
            env::var("PLATFORM_EXPLORER_DATA_CONTRACT_IDENTIFIER")
                .expect("You've not set the PLATFORM_EXPLORER_DATA_CONTRACT_IDENTIFIER")
                .parse()
                .expect("Failed to parse PLATFORM_EXPLORER_DATA_CONTRACT_IDENTIFIER env");
        let platform_explorer_identifier =
            Identifier::from_string(&platform_explorer_identifier_string, Base58).unwrap();

        PSQLProcessor {
            decoder,
            dao,
            platform_explorer_identifier,
            dashcore_rpc,
            redis,
            redis_pubsub_new_block_channel,
        }
    }

    pub async fn get_latest_block_height(&self) -> i32 {
        self.dao.get_latest_block_height().await.unwrap()
    }

    pub async fn process_system_data_contract(
        &self,
        system_data_contract: SystemDataContract,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let data_contract = DataContract::from(system_data_contract);
        let data_contract_identifier = data_contract.identifier.clone();
        let data_contract_owner = data_contract.owner.clone();
        self.dao
            .create_data_contract(data_contract.clone(), None, sql_transaction)
            .await;

        self.handle_data_contract_transition(None, data_contract.identifier, sql_transaction)
            .await;

        match system_data_contract {
            SystemDataContract::Withdrawals => {}
            SystemDataContract::MasternodeRewards => {}
            SystemDataContract::FeatureFlags => {}
            SystemDataContract::DPNS => {
                let dash_tld_document_values = platform_value!({
                    "label" : "dash",
                    "normalizedLabel" : "dash",
                    "parentDomainName" : "",
                    "normalizedParentDomainName" : "",
                    "preorderSalt" : BinaryData::new(
                        [
                    224, 181, 8, 197, 163, 104, 37, 162, 6, 105, 58, 31, 65, 74, 161, 62, 219, 236, 244, 60, 65,
                    227, 199, 153, 234, 158, 115, 123, 79, 154, 162, 38,
                    ].to_vec()),
                    "records" : {
                        "dashAliasIdentityId" : data_contract_owner.to_string(Base58),
                    },
                    "subdomainRules": {
                        "allowSubdomains": true,
                    }
                });

                let dash_tld_document = Document {
                    owner: Some(data_contract_owner),
                    identifier: Identifier::from_bytes(&[
                        215, 242, 197, 63, 70, 169, 23, 171, 110, 91, 57, 162, 215, 188, 38, 11,
                        100, 146, 137, 69, 55, 68, 209, 224, 212, 242, 106, 141, 142, 255, 55, 207,
                    ])
                    .unwrap(),
                    document_type_name: String::from("domain"),
                    data_contract_identifier,
                    data: Some(serde_json::to_value(dash_tld_document_values).unwrap()),
                    deleted: false,
                    revision: 0,
                    is_system: true,
                    price: None,
                    transition_type: DocumentTransitionActionType::Create,
                    prefunded_voting_balance: None,
                };

                self.dao
                    .create_document(dash_tld_document, None, sql_transaction)
                    .await
                    .unwrap();

                self.handle_data_contract_transition(
                    None,
                    data_contract.identifier,
                    sql_transaction,
                )
                .await;
            }
            // TODO: Implement contracts
            SystemDataContract::Dashpay => {}
            SystemDataContract::WalletUtils => {}
            SystemDataContract::TokenHistory => {}
            SystemDataContract::KeywordSearch => {}
        }
    }

    pub async fn set_indexing_flag(&mut self, indexing_flag: bool) {
        if let Some(redis) = &mut self.redis {
            redis
                .set("indexing", indexing_flag.to_string())
                .expect("Failed to set indexing flag")
        }
    }
}
