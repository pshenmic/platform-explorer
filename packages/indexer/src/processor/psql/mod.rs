mod dao;

use std::ops::DerefMut;
use dpp::state_transition::{StateTransition, StateTransitionLike, StateTransitionType};
use deadpool_postgres::{Config, Manager, ManagerConfig, Pool, RecyclingMethod, Runtime, tokio_postgres, Transaction};
use dpp::dashcore::bech32::ToBase32;
use dpp::platform_value::string_encoding::Encoding;
use dpp::state_transition::data_contract_create_transition::accessors::DataContractCreateTransitionAccessorsV0;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use crate::models::{TDBlock, TDBlockHeader};
use crate::processor::psql::dao::PostgresDAO;
use base64::{Engine as _, engine::{general_purpose}};
use dpp::serialization::PlatformSerializable;
use dpp::state_transition::StateTransition::DataContractCreate;
use crate::decoder::decoder::StateTransitionDecoder;

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
        self.dao.create_data_contract(state_transition).await;
    }

    pub async fn get_latest_block(&self, state_transition: DataContractCreateTransition) -> i32 {
        let block = self.dao.get_latest_block().await;

        return block;
    }

    pub async fn handle_st(&self, block_id: i32, state_transition: StateTransition) -> () {
        let mut st_type: i32 = 999;
        let mut bytes: Vec<u8> = Vec::new();

        match state_transition {
            StateTransition::DataContractCreate(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::DataContractCreate(
                    st.clone()
                )).unwrap();

                self.handle_data_contract_create(st).await
            }
            StateTransition::DataContractUpdate(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::DataContractUpdate(
                    st.clone()
                )).unwrap();
            }
            StateTransition::DocumentsBatch(st) => {
                st_type = st.state_transition_type() as i32;
                bytes = PlatformSerializable::serialize_to_bytes(&StateTransition::DocumentsBatch(
                    st.clone()
                )).unwrap();
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

        self.dao.create_state_transition(block_id, st_type, bytes).await;
    }

    pub async fn handle_block(&self, block: TDBlock) -> () {
        let processed = self.dao.get_block_header_by_height(block.header.block_height.clone()).await;

        match processed {
            None => {
                // TODO IMPLEMENT PSQL TRANSACTION

                let block_height = block.header.block_height.clone();

                let block_id = self.dao.create_block(block.header).await;

                if block.txs.len() as i32 == 0 {
                    println!("No platform transactions at block height {}", block_height.clone());
                }

                for tx_base_64 in block.txs.iter() {
                    let bytes = general_purpose::STANDARD.decode(tx_base_64).unwrap();
                    let st_result = self.decoder.decode(bytes).await;

                    let state_transition = st_result.unwrap();

                    self.handle_st(block_id, state_transition).await;

                    println!("Processed DataContractCreate at height {}", block_height)
                }
            }
            Some(st) => {
                println!("Block at the height {} has been already processed", &block.header.block_height);
            }
        }
    }
}
