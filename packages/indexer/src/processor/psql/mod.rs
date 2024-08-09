mod dao;

use std::env;
use std::num::ParseIntError;
use dpp::state_transition::{StateTransition, StateTransitionLike};
use deadpool_postgres::{PoolError};
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use crate::processor::psql::dao::PostgresDAO;
use base64::{Engine as _, engine::{general_purpose}};
use data_contracts::SystemDataContract;
use dpp::identifier::Identifier;
use dpp::platform_value::{platform_value, BinaryData, Value};
use dpp::platform_value::btreemap_extensions::BTreeValueMapPathHelper;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::serialization::PlatformSerializable;
use dpp::state_transition::documents_batch_transition::accessors::DocumentsBatchTransitionAccessorsV0;
use dpp::state_transition::documents_batch_transition::{DocumentsBatchTransition};
use sha256::digest;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use dpp::state_transition::documents_batch_transition::document_transition::DocumentTransitionV0Methods;
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
use crate::entities::validator::Validator;
use crate::models::{TransactionResult, TransactionStatus};

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
}

impl PSQLProcessor {
    pub fn new() -> PSQLProcessor {
        let dao = PostgresDAO::new();
        let decoder = StateTransitionDecoder::new();
        let platform_explorer_identifier_string: String = env::var("PLATFORM_EXPLORER_DATA_CONTRACT_IDENTIFIER").expect("You've not set the PLATFORM_EXPLORER_DATA_CONTRACT_IDENTIFIER").parse().expect("Failed to parse PLATFORM_EXPLORER_DATA_CONTRACT_IDENTIFIER env");
        let platform_explorer_identifier = Identifier::from_string(&platform_explorer_identifier_string, Base58).unwrap();
        return PSQLProcessor { decoder, dao, platform_explorer_identifier };
    }

    pub async fn handle_data_contract_create(&self, state_transition: DataContractCreateTransition, st_hash: String) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao.create_data_contract(data_contract, Some(st_hash)).await;
    }

    pub async fn handle_data_contract_update(&self, state_transition: DataContractUpdateTransition, st_hash: String) -> () {
        let data_contract = DataContract::from(state_transition);

        self.dao.create_data_contract(data_contract, Some(st_hash)).await;
    }

    pub async fn handle_documents_batch(&self, state_transition: DocumentsBatchTransition, st_hash: String) -> () {
        let transitions = state_transition.transitions().clone();

        for (_, document_transition) in transitions.iter().enumerate() {
            let document = Document::from(document_transition.clone());

            self.dao.create_document(document, Some(st_hash.clone())).await.unwrap();

            let document_type = document_transition.document_type_name();

            if document_type == "domain" && document_transition.data_contract_id() == SystemDataContract::DPNS.id() {
                let label = document_transition
                    .data()
                    .unwrap()
                    .get_str_at_path("label")
                    .unwrap();

                let normalized_parent_domain_name = document_transition
                    .data()
                    .unwrap()
                    .get_str_at_path("parentDomainName")
                    .unwrap();

                let identity_identifier = document_transition
                    .data()
                    .unwrap()
                    .get_optional_at_path("records.identity")
                    .unwrap()
                    .expect("Could not find DPNS domain document identity identifier");

                let identity_identifier = Identifier::from_bytes(&identity_identifier.clone().into_identifier_bytes().unwrap()).unwrap().to_string(Base58);
                let identity = self.dao.get_identity_by_identifier(identity_identifier.clone()).await.unwrap().expect(&format!("Could not find identity with identifier {}", identity_identifier));
                let alias = format!("{}.{}", label, normalized_parent_domain_name);

                self.dao.create_identity_alias(identity, alias).await.unwrap();
            }

            if document_type == "dataContracts" && document_transition.data_contract_id() == self.platform_explorer_identifier {
                let data_contract_identifier_str = document_transition
                    .data()
                    .unwrap()
                    .get_str_at_path("identifier")
                    .unwrap();

                let data_contract_identifier = Identifier::from_string(data_contract_identifier_str, Base58).unwrap();

                let data_contract_name = document_transition
                    .data()
                    .unwrap()
                    .get_str_at_path("name")
                    .unwrap();

                let data_contract = self.dao.get_data_contract_by_identifier(data_contract_identifier).await
                    .expect(&format!("Could not get DataContract with identifier {} from the database",
                                     data_contract_identifier_str))
                    .expect(&format!("Could not find DataContract with identifier {} in the database",
                                     data_contract_identifier_str));


                if data_contract.owner == state_transition.owner_id() {
                    self.dao.set_data_contract_name(data_contract, String::from(data_contract_name)).await.unwrap();
                } else {
                    println!("Failed to set custom data contract name for contract {}, owner of the tx {} does not match data contract", st_hash, document.identifier.to_string(Base58));
                }
            }
        }
    }

    pub async fn handle_identity_create(&self, state_transition: IdentityCreateTransition, st_hash: String) -> () {
        let identity = Identity::from(state_transition);
        let transfer = Transfer {
            id: None,
            sender: None,
            recipient: Some(identity.identifier),
            amount: identity.balance.expect("Balance missing from identity"),
        };

        self.dao.create_identity(identity, Some(st_hash.clone())).await.unwrap();
        self.dao.create_transfer(transfer, st_hash.clone()).await.unwrap();
    }

    pub async fn handle_identity_update(&self, state_transition: IdentityUpdateTransition, st_hash: String) -> () {
        let identity = Identity::from(state_transition);

        self.dao.create_identity(identity, Some(st_hash.clone())).await.unwrap();
    }

    pub async fn handle_identity_top_up(&self, state_transition: IdentityTopUpTransition, st_hash: String) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao.create_transfer(transfer, st_hash.clone()).await.unwrap();
    }

    pub async fn handle_identity_credit_withdrawal(&self, state_transition: IdentityCreditWithdrawalTransition, st_hash: String) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao.create_transfer(transfer, st_hash.clone()).await.unwrap();
    }

    pub async fn handle_identity_credit_transfer(&self, state_transition: IdentityCreditTransferTransition, st_hash: String) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao.create_transfer(transfer, st_hash.clone()).await.unwrap();
    }

    pub async fn handle_st(&self, block_hash: String, index: u32, state_transition: StateTransition, tx_result: TransactionResult) -> () {
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
            StateTransition::MasternodeVote(st) => st.state_transition_type() as u32
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
            StateTransition::MasternodeVote(st) => {
                PlatformSerializable::serialize_to_bytes(&StateTransition::MasternodeVote(
                    st.clone()
                )).unwrap()
            }
        };

        let st_hash = digest(bytes.clone()).to_uppercase();

        let tx_result_status = tx_result.status.clone();

        self.dao.create_state_transition(block_hash.clone(), owner, st_type, index, bytes, tx_result.gas_used, tx_result.status, tx_result.error).await;

        match tx_result_status {
            TransactionStatus::FAIL => {
                return;
            }
            TransactionStatus::SUCCESS => {}
        }

        match state_transition {
            StateTransition::DataContractCreate(st) => {
                self.handle_data_contract_create(st, st_hash).await;

                println!("Processed DataContractCreate at block hash {}", block_hash);
            }
            StateTransition::DataContractUpdate(_st) => {
                self.handle_data_contract_update(_st, st_hash).await;

                println!("Processed DataContractUpdate at block hash {}", block_hash);
            }
            StateTransition::DocumentsBatch(_st) => {
                self.handle_documents_batch(_st, st_hash).await;

                println!("Processed DocumentsBatch at block hash {}", block_hash);
            }
            StateTransition::IdentityCreate(_st) => {
                self.handle_identity_create(_st, st_hash).await;

                println!("Processed IdentityCreate at block hash {}", block_hash);
            }
            StateTransition::IdentityTopUp(_st) => {
                self.handle_identity_top_up(_st, st_hash).await;

                println!("Processed IdentityTopUp at block hash {}", block_hash);
            }
            StateTransition::IdentityCreditWithdrawal(_st) => {
                self.handle_identity_credit_withdrawal(_st, st_hash).await;

                println!("Processed IdentityCreditWithdrawal at block hash {}", block_hash);
            }
            StateTransition::IdentityUpdate(_st) => {
                self.handle_identity_update(_st, st_hash).await;

                println!("Processed IdentityUpdate at block hash {}", block_hash);
            }
            StateTransition::IdentityCreditTransfer(_st) => {
                self.handle_identity_credit_transfer(_st, st_hash).await;

                println!("Processed IdentityCreditTransfer at block hash {}", block_hash);
            }
            StateTransition::MasternodeVote(_) => {
            }
        }
    }

    pub async fn handle_validator(&self, validator: Validator) -> Result<(), ProcessorError> {
        let existing = self.dao.get_validator_by_pro_tx_hash(validator.pro_tx_hash.clone()).await?;

        match existing {
            None => {
                self.dao.create_validator(validator).await?;
                Ok(())
            }
            Some(_) => Ok(())
        }
    }

    pub async fn handle_block(&self, block: Block, validators: Vec<Validator>) -> Result<(), ProcessorError> {
        let processed = self.dao.get_block_header_by_height(block.header.height.clone()).await?;

        match processed {
            None => {
                // TODO IMPLEMENT PSQL TRANSACTION
                let block_height = block.header.height.clone();

                if block.header.height == 1 {
                    self.handle_init_chain().await;
                }

                for (_, validator) in validators.iter().enumerate() {
                    self.handle_validator(validator.clone()).await?;
                }

                let block_hash = self.dao.create_block(block.header).await;

                if block.txs.len() as i32 == 0 {
                    println!("No platform transactions at block height {}", block_height.clone());
                }

                println!("Processing block at height {}", block_height.clone());
                for (i, tx) in block.txs.iter().enumerate() {
                    let bytes = general_purpose::STANDARD.decode(tx.data.clone()).unwrap();
                    let st_result = self.decoder.decode(bytes).await;

                    let state_transition = st_result.unwrap();

                    self.handle_st(block_hash.clone(), i as u32, state_transition, tx.clone()).await;
                }

                Ok(())
            }
            Some(_) => {
                println!("Block at the height {} has been already processed", &block.header.height);
                Ok(())
            }
        }
    }

    pub async fn process_system_data_contract(&self, system_data_contract: SystemDataContract) -> () {
        let data_contract = DataContract::from(system_data_contract);
        let identity = Identity::from(system_data_contract);
        let data_contract_identifier = data_contract.identifier.clone();
        let data_contract_owner = data_contract.owner.clone();

        self.dao.create_identity(identity, None).await.unwrap();
        self.dao.create_data_contract(data_contract, None).await;

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
                    id: None,
                    owner: Some(data_contract_owner),
                    identifier: Identifier::from_bytes(&[
                        215, 242, 197, 63, 70, 169, 23, 171, 110, 91, 57, 162, 215, 188, 38, 11, 100, 146, 137, 69, 55,
                        68, 209, 224, 212, 242, 106, 141, 142, 255, 55, 207,
                    ]).unwrap(),
                    data_contract_identifier,
                    data: Some(serde_json::to_value(dash_tld_document_values).unwrap()),
                    deleted: false,
                    revision: 0,
                    is_system: true,
                };

                self.dao.create_document(dash_tld_document, None).await.unwrap();
            }
            SystemDataContract::Dashpay => {}
        }
    }


    pub async fn handle_init_chain(&self) -> () {
        println!("Processing initChain");

        println!("Processing SystemDataContract::Withdrawals");
        self.process_system_data_contract(SystemDataContract::Withdrawals).await;

        println!("Processing SystemDataContract::MasternodeRewards");
        self.process_system_data_contract(SystemDataContract::MasternodeRewards).await;

        println!("Processing SystemDataContract::FeatureFlags");
        self.process_system_data_contract(SystemDataContract::FeatureFlags).await;

        println!("Processing SystemDataContract::DPNS");
        self.process_system_data_contract(SystemDataContract::DPNS).await;

        println!("Processing SystemDataContract::Dashpay");
        self.process_system_data_contract(SystemDataContract::Dashpay).await;

        println!("Finished initChain processing");
    }
}
