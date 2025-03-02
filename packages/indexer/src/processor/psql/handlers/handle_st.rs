use dpp::serialization::PlatformSerializable;
use dpp::state_transition::{StateTransition, StateTransitionLike};
use sha256::digest;
use crate::models::{TransactionResult, TransactionStatus};
use crate::processor::psql::PSQLProcessor;

impl PSQLProcessor {
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
      StateTransition::MasternodeVote(_st) => {
        self.handle_masternode_vote(_st, st_hash).await.unwrap();

        println!("Processed Masternode vote at block hash {}", block_hash);
      }
    }
  }
}