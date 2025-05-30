use deadpool_postgres::Transaction;
use dpp::identifier::Identifier;
use dpp::state_transition::batch_transition::batched_transition::BatchedTransition;
use dpp::state_transition::batch_transition::batched_transition::token_transition::TokenTransition;
use dpp::state_transition::batch_transition::BatchTransitionV0;
use dpp::state_transition::batch_transition::token_burn_transition::v0::v0_methods::TokenBurnTransitionV0Methods;
use dpp::state_transition::batch_transition::token_claim_transition::v0::v0_methods::TokenClaimTransitionV0Methods;
use dpp::state_transition::batch_transition::token_config_update_transition::v0::v0_methods::TokenConfigUpdateTransitionV0Methods;
use dpp::state_transition::batch_transition::token_destroy_frozen_funds_transition::v0::v0_methods::TokenDestroyFrozenFundsTransitionV0Methods;
use dpp::state_transition::batch_transition::token_emergency_action_transition::v0::v0_methods::TokenEmergencyActionTransitionV0Methods;
use dpp::state_transition::batch_transition::token_freeze_transition::v0::v0_methods::TokenFreezeTransitionV0Methods;
use dpp::state_transition::batch_transition::token_mint_transition::v0::v0_methods::TokenMintTransitionV0Methods;
use dpp::state_transition::batch_transition::token_set_price_for_direct_purchase_transition::v0::v0_methods::TokenSetPriceForDirectPurchaseTransitionV0Methods;
use dpp::state_transition::batch_transition::token_transfer_transition::v0::v0_methods::TokenTransferTransitionV0Methods;
use dpp::state_transition::batch_transition::token_unfreeze_transition::v0::v0_methods::TokenUnfreezeTransitionV0Methods;
use dpp::state_transition::StateTransitionLike;
use crate::processor::psql::PSQLProcessor;

impl PSQLProcessor {
  pub async fn handle_batch_v0(&self, state_transition: BatchTransitionV0, st_hash: String, sql_transaction: &Transaction<'_>) -> () {
    let transitions = state_transition.transitions.clone();

    for (_, document_transition) in transitions.iter().enumerate() {
      self.handle_document_transition(document_transition.clone(), state_transition.owner_id(), st_hash.clone(), sql_transaction).await
    }
  }

  pub async fn handle_batch_v1(&self, transitions: Vec<BatchedTransition>, owner_id: Identifier, st_hash: String, sql_transaction: &Transaction<'_>) -> () {

    for (_, token_transition) in transitions.iter().enumerate() {

      match token_transition {
        BatchedTransition::Token(transition) => {
          match transition {
            TokenTransition::Mint(mint) =>{
              self.dao.token_transition(
                transition.clone(),
                Some(mint.amount()),
                mint.public_note(),
                owner_id,
                mint.issued_to_identity_id(),
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::Burn(burn) => {
              self.dao.token_transition(
                transition.clone(),
                Some(burn.burn_amount()),
                burn.public_note(),
                owner_id,
                None,
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::Transfer(transfer) => {
              self.dao.token_transition(
                transition.clone(),
                Some(transfer.amount()),
                transfer.public_note(),
                owner_id,
                Some(transfer.recipient_id()),
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::Freeze(freeze) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                freeze.public_note(),
                owner_id,
                Some(freeze.frozen_identity_id()),
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::Unfreeze(unfreeze) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                unfreeze.public_note(),
                owner_id,
                Some(unfreeze.frozen_identity_id()),
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::DestroyFrozenFunds(destroy_frozen_funds) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                destroy_frozen_funds.public_note(),
                owner_id,
                Some(destroy_frozen_funds.frozen_identity_id()),
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::EmergencyAction(emergency_action) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                emergency_action.public_note(),
                owner_id,
                None,
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::ConfigUpdate(config_update) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                config_update.public_note(),
                owner_id,
                None,
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::Claim(config_update) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                config_update.public_note(),
                owner_id,
                None,
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::DirectPurchase(_) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                None,
                owner_id,
                None,
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
            TokenTransition::SetPriceForDirectPurchase(config_update) => {
              self.dao.token_transition(
                transition.clone(),
                None,
                config_update.public_note(),
                owner_id,
                None,
                st_hash.clone(),
                sql_transaction
              ).await.unwrap()
            }
          }
        }
        BatchedTransition::Document(document_transition) => {
          self.handle_document_transition(document_transition.clone(), owner_id, st_hash.clone(), sql_transaction).await
        }
      }
    }
  }
}