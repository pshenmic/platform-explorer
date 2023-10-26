mod dao;

use std::num::ParseIntError;
use dpp::state_transition::{StateTransition, StateTransitionLike};
use deadpool_postgres::{PoolError};
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use crate::processor::psql::dao::PostgresDAO;
use base64::{Engine as _, engine::{general_purpose}};
use dpp::data_contracts::SystemDataContract;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::serialization::PlatformSerializable;
use dpp::state_transition::documents_batch_transition::accessors::DocumentsBatchTransitionAccessorsV0;
use dpp::state_transition::documents_batch_transition::{DocumentsBatchTransition};
use sha256::digest;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_credit_transfer_transition::IdentityCreditTransferTransition;
use dpp::state_transition::identity_credit_withdrawal_transition::IdentityCreditWithdrawalTransition;
use dpp::state_transition::identity_topup_transition::IdentityTopUpTransition;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;
use crate::decoder::decoder::StateTransitionDecoder;
use crate::entities::block::Block;
use crate::entities::data_contract::DataContract;
use crate::entities::document::Document;
use crate::entities::identity::Identity;
use crate::entities::transfer::Transfer;

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

    pub async fn handle_data_contract_create(&self, state_transition: DataContractCreateTransition, st_hash: String) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao.create_data_contract(data_contract, st_hash).await;
    }

    pub async fn handle_data_contract_update(&self, state_transition: DataContractUpdateTransition, st_hash: String) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao.create_data_contract(data_contract, st_hash).await;
    }

    pub async fn handle_documents_batch(&self, state_transition: DocumentsBatchTransition, st_hash: String) -> () {
        let transitions = state_transition.transitions().clone();

        for (_, document_transition) in transitions.iter().enumerate() {
            let document = Document::from(document_transition.clone());

            self.dao.create_document(document, st_hash.clone()).await;
        }
    }

    pub async fn handle_identity_create(&self, state_transition: IdentityCreateTransition, st_hash: String) -> () {
        let identity = Identity::from(state_transition);

        self.dao.create_identity(identity, st_hash.clone()).await;
    }

    pub async fn handle_identity_update(&self, state_transition: IdentityUpdateTransition, st_hash: String) -> () {
        let identity = Identity::from(state_transition);

        self.dao.create_identity(identity, st_hash.clone()).await;
    }

    pub async fn handle_identity_top_up(&self, state_transition: IdentityTopUpTransition, st_hash: String) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao.create_transfer(transfer, st_hash.clone()).await;
    }

    pub async fn handle_identity_credit_withdrawal(&self, state_transition: IdentityCreditWithdrawalTransition, st_hash: String) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao.create_transfer(transfer, st_hash.clone()).await;
    }

    pub async fn handle_identity_credit_transfer(&self, state_transition: IdentityCreditTransferTransition, st_hash: String) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao.create_transfer(transfer, st_hash.clone()).await;
    }

    pub async fn handle_st(&self, block_hash: String, index: u32, state_transition: StateTransition) -> () {
        let owner = state_transition.owner_id();

        let st_type = match state_transition.clone() {
            StateTransition::DataContractCreate(st) => st.state_transition_type() as u32,
            StateTransition::DataContractUpdate(st) => st.state_transition_type() as u32,
            StateTransition::DocumentsBatch(st) => st.state_transition_type() as u32,
            StateTransition::IdentityCreate(st) => st.state_transition_type() as u32,
            StateTransition::IdentityTopUp(st) => st.state_transition_type() as u32,
            StateTransition::IdentityCreditWithdrawal(st) => st.state_transition_type() as u32,
            StateTransition::IdentityUpdate(st) => st.state_transition_type() as u32,
            StateTransition::IdentityCreditTransfer(st) => st.state_transition_type() as u32,
        };

        let bytes = match state_transition.clone() {
            StateTransition::DataContractCreate(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::DataContractCreate(
                    st.clone()
                )).unwrap(),
            StateTransition::DataContractUpdate(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::DataContractUpdate(
                    st.clone()
                )).unwrap(),
            StateTransition::DocumentsBatch(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::DocumentsBatch(
                    st.clone()
                )).unwrap(),
            StateTransition::IdentityCreate(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreate(
                    st.clone()
                )).unwrap(),
            StateTransition::IdentityTopUp(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityTopUp(
                    st.clone()
                )).unwrap(),
            StateTransition::IdentityCreditWithdrawal(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreditWithdrawal(
                    st.clone()
                )).unwrap(),
            StateTransition::IdentityUpdate(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityUpdate(
                    st.clone()
                )).unwrap(),
            StateTransition::IdentityCreditTransfer(st) =>
                PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreditTransfer(
                    st.clone()
                )).unwrap(),
        };

        let st_hash = digest(bytes.clone()).to_uppercase();

        self.dao.create_state_transition(block_hash.clone(), owner, st_type, index, bytes).await;

        match state_transition {
            StateTransition::DataContractCreate(st) => {
                self.handle_data_contract_create(st, st_hash).await;

                println!("Processed DataContractCreate at block hash {}", block_hash);
            }
            StateTransition::DataContractUpdate(st) => {
                self.handle_data_contract_update(st, st_hash).await;

                println!("Processed DataContractUpdate at block hash {}", block_hash);
            }
            StateTransition::DocumentsBatch(st) => {
                self.handle_documents_batch(st, st_hash).await;

                println!("Processed DocumentsBatch at block hash {}", block_hash);
            }
            StateTransition::IdentityCreate(st) => {
                self.handle_identity_create(st, st_hash).await;

                println!("Processed IdentityCreate at block hash {}", block_hash);
            }
            StateTransition::IdentityTopUp(st) => {
                self.handle_identity_top_up(st, st_hash).await;

                println!("Processed IdentityTopUp at block hash {}", block_hash);
            }
            StateTransition::IdentityCreditWithdrawal(st) => {
                self.handle_identity_credit_withdrawal(st, st_hash).await;

                println!("Processed IdentityCreditWithdrawal at block hash {}", block_hash);
            }
            StateTransition::IdentityUpdate(st) => {
                self.handle_identity_update(st, st_hash).await;

                println!("Processed IdentityUpdate at block hash {}", block_hash);
            }
            StateTransition::IdentityCreditTransfer(st) => {
                self.handle_identity_credit_transfer(st, st_hash).await;

                println!("Processed IdentityCreditTransfer at block hash {}", block_hash);
            }
        }
    }

    pub async fn handle_block(&self, block: Block) -> Result<(), ProcessorError> {
        let processed = self.dao.get_block_header_by_height(block.header.height.clone()).await?;

        match processed {
            None => {
                // TODO IMPLEMENT PSQL TRANSACTION
                let block_height = block.header.height.clone();

                if block.header.height == 1 {
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

                    self.handle_st(block_hash.clone(), i as u32, state_transition).await;
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
        self.dao.create_data_contract(data_contract, String::from("initChain")).await;

        system_contract = SystemDataContract::MasternodeRewards;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::MasternodeRewards {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract, String::from("initChain")).await;

        system_contract = SystemDataContract::FeatureFlags;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::FeatureFlags {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract, String::from("initChain")).await;

        system_contract = SystemDataContract::DPNS;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::DPNS {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract, String::from("initChain")).await;

        system_contract = SystemDataContract::Dashpay;
        data_contract = DataContract::from(system_contract);
        println!("Processing SystemDataContract::Dashpay {}", data_contract.identifier.to_string(Base58));
        self.dao.create_data_contract(data_contract, String::from("initChain")).await;
    }
}
