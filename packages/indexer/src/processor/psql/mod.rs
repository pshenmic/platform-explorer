mod dao;

use std::num::ParseIntError;
use dpp::state_transition::{StateTransition, StateTransitionLike};
use deadpool_postgres::{PoolError};
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use crate::processor::psql::dao::PostgresDAO;
use base64::{Engine as _, engine::{general_purpose}};
use dpp::data_contracts::SystemDataContract;
use dpp::platform_value::string_encoding::Encoding;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::serialization::PlatformSerializable;
use dpp::state_transition::data_contract_create_transition::accessors::DataContractCreateTransitionAccessorsV0;
use dpp::state_transition::documents_batch_transition::accessors::DocumentsBatchTransitionAccessorsV0;
use dpp::state_transition::documents_batch_transition::{DocumentCreateTransition, DocumentReplaceTransition, DocumentsBatchTransition};
use dpp::state_transition::documents_batch_transition::document_transition::DocumentTransition;
use sha256::digest;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use crate::decoder::decoder::StateTransitionDecoder;
use crate::entities::block::Block;
use crate::entities::data_contract::DataContract;
use crate::entities::document::Document;
use crate::processor::psql::ProcessorError::UnexpectedError;

pub enum ProcessorError {
    DatabaseError,
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
}

impl PSQLProcessor {
    pub fn new() -> PSQLProcessor {
        let dao = PostgresDAO::new();
        let decoder = StateTransitionDecoder::new();

        return PSQLProcessor { decoder, dao };
    }

    pub async fn handle_data_contract_create(&self, state_transition: DataContractCreateTransition) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao.create_data_contract(data_contract).await;
    }

    pub async fn handle_data_contract_update(&self, state_transition: DataContractUpdateTransition) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao.create_data_contract(data_contract).await;
    }

    pub async fn handle_documents_batch(&self, state_transition: DocumentsBatchTransition, st_hash: String) -> () {
        let transitions = state_transition.transitions().clone();

        for (i, document_transition) in transitions.iter().enumerate() {
            let document = Document::from(document_transition.clone());

            self.dao.create_document(document, st_hash.clone()).await;
        }
    }

    pub async fn handle_st(&self, block_hash: String, index: i32, state_transition: StateTransition) -> () {
        let mut st_type: i32 = 999;
        let mut bytes: Vec<u8> = Vec::new();

        match state_transition {
            StateTransition::DataContractCreate(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::DataContractCreate(
                    st.clone()
                )).unwrap();
                self.dao.create_state_transition(block_hash.clone(), st_type, index, bytes).await;

                self.handle_data_contract_create(st).await;

                println!("Processed DataContractCreate at block hash {}", block_hash);
            }
            StateTransition::DataContractUpdate(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::DataContractUpdate(
                    st.clone()
                )).unwrap();
                self.dao.create_state_transition(block_hash.clone(), st_type, index, bytes).await;

                self.handle_data_contract_update(st).await;

                println!("Processed DataContractUpdate at block hash {}", block_hash);
            }
            StateTransition::DocumentsBatch(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::DocumentsBatch(
                    st.clone()
                )).unwrap();

                let st_hash = digest(bytes.clone()).to_uppercase();

                self.dao.create_state_transition(block_hash.clone(), st_type, index, bytes.clone()).await;

                self.handle_documents_batch(st, st_hash).await;

                println!("Processed DocumentsBatch at block hash {}", block_hash);
            }
            StateTransition::IdentityCreate(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreate(
                    st.clone()
                )).unwrap();
            }
            StateTransition::IdentityTopUp(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityTopUp(
                    st.clone()
                )).unwrap();
            }
            StateTransition::IdentityCreditWithdrawal(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreditWithdrawal(
                    st.clone()
                )).unwrap();
            }
            StateTransition::IdentityUpdate(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityUpdate(
                    st.clone()
                )).unwrap();
            }
            StateTransition::IdentityCreditTransfer(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreditTransfer(
                    st.clone()
                )).unwrap();
            }
        }
    }

    pub async fn handle_block(&self, block: Block) -> Result<(), ProcessorError> {
        let processed = self.dao.get_block_header_by_height(block.header.height.clone()).await?;

        match processed {
            None => {
                // TODO IMPLEMENT PSQL TRANSACTION
                let block_height = block.header.height.clone();

                if (block.header.height == 1) {
                    self.handle_init_chain().await;
                }

                let block_hash = self.dao.create_block(block.header).await;

                if block.txs.len() as i32 == 0 {
                    println!("No platform transactions at block height {}", block_height.clone());
                }

                println!("Processing block at height {}", block_height.clone());
                for (i, tx_base_64) in block.txs.iter().enumerate() {
                    let bytes = general_purpose::STANDARD.decode(tx_base_64).unwrap();
                    let st_result = self.decoder.decode(bytes).await;

                    let state_transition = st_result.unwrap();

                    self.handle_st(block_hash.clone(), i as i32, state_transition).await;
                }

                Ok(())
            }
            Some(_) => {
                println!("Block at the height {} has been already processed", &block.header.height);
                Ok(())
            }
        }
    }


    pub async fn handle_init_chain(&self) -> () {
        println!("Processing initChain");

        let mut system_contract;
        let mut data_contract;

        system_contract = SystemDataContract::Withdrawals;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::Withdrawals {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract).await;

        system_contract = SystemDataContract::MasternodeRewards;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::MasternodeRewards {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract).await;

        system_contract = SystemDataContract::FeatureFlags;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::FeatureFlags {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract).await;

        system_contract = SystemDataContract::DPNS;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::DPNS {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract).await;

        system_contract = SystemDataContract::Dashpay;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::Dashpay {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract).await;
    }
}
