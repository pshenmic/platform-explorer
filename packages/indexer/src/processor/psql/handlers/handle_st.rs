use crate::enums::batch_type::BatchType;
use crate::models::{TransactionResult, TransactionStatus};
use crate::processor::psql::PSQLProcessor;
use deadpool_postgres::Transaction;
use dpp::serialization::PlatformSerializable;
use dpp::state_transition::batch_transition::batched_transition::document_transition::DocumentTransition;
use dpp::state_transition::batch_transition::batched_transition::token_transition::TokenTransition;
use dpp::state_transition::batch_transition::batched_transition::BatchedTransition;
use dpp::state_transition::batch_transition::BatchTransition;
use dpp::state_transition::{StateTransition, StateTransitionLike};
use sha256::digest;

impl PSQLProcessor {
    pub async fn handle_st(
        &self,
        block_hash: String,
        block_height: i32,
        index: u32,
        state_transition: StateTransition,
        tx_result: TransactionResult,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let owner = state_transition.owner_id();

        let st_type = get_st_type(state_transition.clone());

        let batch_type: Option<BatchType> = match state_transition.clone() {
            StateTransition::Batch(batch_transition) => match batch_transition {
                BatchTransition::V0(v0) => match v0.transitions.first().unwrap() {
                    DocumentTransition::Create(_) => Some(BatchType::DocumentCreateTransition),
                    DocumentTransition::Replace(_) => Some(BatchType::DocumentReplaceTransition),
                    DocumentTransition::Delete(_) => Some(BatchType::DocumentDeleteTransition),
                    DocumentTransition::Transfer(_) => Some(BatchType::DocumentTransferTransition),
                    DocumentTransition::UpdatePrice(_) => {
                        Some(BatchType::DocumentUpdatePriceTransition)
                    }
                    DocumentTransition::Purchase(_) => Some(BatchType::DocumentPurchaseTransition),
                },
                BatchTransition::V1(v1) => match v1.transitions.first().unwrap() {
                    BatchedTransition::Document(document_transition) => match document_transition {
                        DocumentTransition::Create(_) => Some(BatchType::DocumentCreateTransition),
                        DocumentTransition::Replace(_) => {
                            Some(BatchType::DocumentReplaceTransition)
                        }
                        DocumentTransition::Delete(_) => Some(BatchType::DocumentDeleteTransition),
                        DocumentTransition::Transfer(_) => {
                            Some(BatchType::DocumentTransferTransition)
                        }
                        DocumentTransition::UpdatePrice(_) => {
                            Some(BatchType::DocumentUpdatePriceTransition)
                        }
                        DocumentTransition::Purchase(_) => {
                            Some(BatchType::DocumentPurchaseTransition)
                        }
                    },
                    BatchedTransition::Token(token_transition) => match token_transition {
                        TokenTransition::Burn(_) => Some(BatchType::TokenBurnTransition),
                        TokenTransition::Mint(_) => Some(BatchType::TokenMintTransition),
                        TokenTransition::Transfer(_) => Some(BatchType::TokenTransferTransition),
                        TokenTransition::Freeze(_) => Some(BatchType::TokenFreezeTransition),
                        TokenTransition::Unfreeze(_) => Some(BatchType::TokenUnfreezeTransition),
                        TokenTransition::DestroyFrozenFunds(_) => {
                            Some(BatchType::TokenDestroyFrozenFundsTransition)
                        }
                        TokenTransition::Claim(_) => Some(BatchType::TokenClaimTransition),
                        TokenTransition::EmergencyAction(_) => {
                            Some(BatchType::TokenEmergencyActionTransition)
                        }
                        TokenTransition::ConfigUpdate(_) => {
                            Some(BatchType::TokenConfigUpdateTransition)
                        }
                        TokenTransition::DirectPurchase(_) => {
                            Some(BatchType::TokenDirectPurchaseTransition)
                        }
                        TokenTransition::SetPriceForDirectPurchase(_) => {
                            Some(BatchType::TokenSetPriceForDirectPurchaseTransition)
                        }
                    },
                },
            },
            _ => None,
        };

        let bytes = get_st_bytes(state_transition.clone());

        let st_hash = digest(bytes.clone()).to_uppercase();

        let tx_result_status = tx_result.status.clone();

        self.dao
            .create_state_transition(
                block_hash.clone(),
                block_height,
                owner,
                st_type,
                index,
                bytes,
                tx_result.gas_used,
                tx_result.status,
                tx_result.error,
                batch_type,
                sql_transaction,
            )
            .await;

        match tx_result_status {
            TransactionStatus::FAIL => {
                return;
            }
            TransactionStatus::SUCCESS => {}
        }

        match state_transition {
            StateTransition::DataContractCreate(st) => {
                self.handle_data_contract_create(st.clone(), st_hash.clone(), sql_transaction)
                    .await;

                println!("Processed DataContractCreate at block hash {}", block_hash);
            }
            StateTransition::DataContractUpdate(st) => {
                self.handle_data_contract_update(st.clone(), st_hash.clone(), sql_transaction)
                    .await;

                println!("Processed DataContractUpdate at block hash {}", block_hash);
            }
            StateTransition::Batch(st) => {
                match st.clone() {
                    BatchTransition::V0(st) => {
                        self.handle_batch_v0(st.clone(), st_hash.clone(), sql_transaction)
                            .await;
                    }
                    BatchTransition::V1(st) => {
                        self.handle_batch_v1(
                            st.transitions.clone(),
                            st.owner_id().clone(),
                            st_hash.clone(),
                            sql_transaction,
                        )
                        .await
                    }
                }

                println!("Processed Batch at block hash {}", block_hash);
            }
            StateTransition::IdentityCreate(_st) => {
                self.handle_identity_create(_st, st_hash, sql_transaction)
                    .await;

                println!("Processed IdentityCreate at block hash {}", block_hash);
            }
            StateTransition::IdentityTopUp(_st) => {
                self.handle_identity_top_up(_st, st_hash, sql_transaction)
                    .await;

                println!("Processed IdentityTopUp at block hash {}", block_hash);
            }
            StateTransition::IdentityCreditWithdrawal(_st) => {
                self.handle_identity_credit_withdrawal(_st, st_hash, sql_transaction)
                    .await;

                println!(
                    "Processed IdentityCreditWithdrawal at block hash {}",
                    block_hash
                );
            }
            StateTransition::IdentityUpdate(_st) => {
                self.handle_identity_update(_st, st_hash, sql_transaction)
                    .await;

                println!("Processed IdentityUpdate at block hash {}", block_hash);
            }
            StateTransition::IdentityCreditTransfer(_st) => {
                self.handle_identity_credit_transfer(_st, st_hash, sql_transaction)
                    .await;

                println!(
                    "Processed IdentityCreditTransfer at block hash {}",
                    block_hash
                );
            }
            StateTransition::MasternodeVote(_st) => {
                self.handle_masternode_vote(_st, st_hash, sql_transaction)
                    .await
                    .unwrap();

                println!("Processed Masternode vote at block hash {}", block_hash);
            }
        }
    }
}

pub fn get_st_type(state_transition: StateTransition) -> u32 {
    match state_transition {
        StateTransition::DataContractCreate(st) => st.state_transition_type() as u32,
        StateTransition::DataContractUpdate(st) => st.state_transition_type() as u32,
        StateTransition::Batch(st) => st.state_transition_type() as u32,
        StateTransition::IdentityCreate(st) => st.state_transition_type() as u32,
        StateTransition::IdentityTopUp(st) => st.state_transition_type() as u32,
        StateTransition::IdentityCreditWithdrawal(st) => st.state_transition_type() as u32,
        StateTransition::IdentityUpdate(st) => st.state_transition_type() as u32,
        StateTransition::IdentityCreditTransfer(st) => st.state_transition_type() as u32,
        StateTransition::MasternodeVote(st) => st.state_transition_type() as u32,
    }
}

pub fn get_st_bytes(state_transition: StateTransition) -> Vec<u8> {
    match state_transition {
        StateTransition::DataContractCreate(st) => PlatformSerializable::serialize_to_bytes(
            &StateTransition::DataContractCreate(st.clone()),
        )
        .unwrap(),
        StateTransition::DataContractUpdate(st) => PlatformSerializable::serialize_to_bytes(
            &StateTransition::DataContractUpdate(st.clone()),
        )
        .unwrap(),
        StateTransition::Batch(st) => {
            PlatformSerializable::serialize_to_bytes(&StateTransition::Batch(st.clone())).unwrap()
        }
        StateTransition::IdentityCreate(st) => {
            PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityCreate(st.clone()))
                .unwrap()
        }
        StateTransition::IdentityTopUp(st) => {
            PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityTopUp(st.clone()))
                .unwrap()
        }
        StateTransition::IdentityCreditWithdrawal(st) => PlatformSerializable::serialize_to_bytes(
            &StateTransition::IdentityCreditWithdrawal(st.clone()),
        )
        .unwrap(),
        StateTransition::IdentityUpdate(st) => {
            PlatformSerializable::serialize_to_bytes(&StateTransition::IdentityUpdate(st.clone()))
                .unwrap()
        }
        StateTransition::IdentityCreditTransfer(st) => PlatformSerializable::serialize_to_bytes(
            &StateTransition::IdentityCreditTransfer(st.clone()),
        )
        .unwrap(),
        StateTransition::MasternodeVote(st) => {
            PlatformSerializable::serialize_to_bytes(&StateTransition::MasternodeVote(st.clone()))
                .unwrap()
        }
    }
}
