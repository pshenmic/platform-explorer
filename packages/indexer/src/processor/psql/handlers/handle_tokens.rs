use deadpool_postgres::Transaction;
use dpp::prelude::Identifier;
use dpp::state_transition::batch_transition::batched_transition::token_transition::{TokenTransition, TokenTransitionV0Methods};
use dpp::state_transition::batch_transition::token_base_transition::v0::v0_methods::TokenBaseTransitionV0Methods;
use dpp::state_transition::batch_transition::token_burn_transition::v0::v0_methods::TokenBurnTransitionV0Methods;
use dpp::state_transition::batch_transition::token_claim_transition::v0::v0_methods::TokenClaimTransitionV0Methods;
use dpp::state_transition::batch_transition::token_config_update_transition::v0::v0_methods::TokenConfigUpdateTransitionV0Methods;
use dpp::state_transition::batch_transition::token_destroy_frozen_funds_transition::v0::v0_methods::TokenDestroyFrozenFundsTransitionV0Methods;
use dpp::state_transition::batch_transition::token_direct_purchase_transition::v0::v0_methods::TokenDirectPurchaseTransitionV0Methods;
use dpp::state_transition::batch_transition::token_emergency_action_transition::v0::v0_methods::TokenEmergencyActionTransitionV0Methods;
use dpp::state_transition::batch_transition::token_freeze_transition::v0::v0_methods::TokenFreezeTransitionV0Methods;
use dpp::state_transition::batch_transition::token_mint_transition::v0::v0_methods::TokenMintTransitionV0Methods;
use dpp::state_transition::batch_transition::token_set_price_for_direct_purchase_transition::v0::v0_methods::TokenSetPriceForDirectPurchaseTransitionV0Methods;
use dpp::state_transition::batch_transition::token_transfer_transition::v0::v0_methods::TokenTransferTransitionV0Methods;
use dpp::state_transition::batch_transition::token_unfreeze_transition::v0::v0_methods::TokenUnfreezeTransitionV0Methods;
use crate::processor::psql::PSQLProcessor;

impl PSQLProcessor {
    pub async fn handle_token_transition(
        &self,
        transition: TokenTransition,
        owner_id: Identifier,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let data_contract_identifier = transition.base().data_contract_id();

        self.handle_data_contract_transition(
            Some(st_hash.clone()),
            data_contract_identifier,
            sql_transaction,
        )
        .await;

        self.dao
            .token_holder(owner_id, transition.token_id(), &sql_transaction)
            .await
            .unwrap();

        match transition.clone() {
            TokenTransition::Mint(mint) => self
                .dao
                .token_transition(
                    transition.clone(),
                    Some(mint.amount()),
                    mint.public_note(),
                    owner_id,
                    mint.issued_to_identity_id(),
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::Burn(burn) => self
                .dao
                .token_transition(
                    transition.clone(),
                    Some(burn.burn_amount()),
                    burn.public_note(),
                    owner_id,
                    None,
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::Transfer(transfer) => self
                .dao
                .token_transition(
                    transition.clone(),
                    Some(transfer.amount()),
                    transfer.public_note(),
                    owner_id,
                    Some(transfer.recipient_id()),
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::Freeze(freeze) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    freeze.public_note(),
                    owner_id,
                    Some(freeze.frozen_identity_id()),
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::Unfreeze(unfreeze) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    unfreeze.public_note(),
                    owner_id,
                    Some(unfreeze.frozen_identity_id()),
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::DestroyFrozenFunds(destroy_frozen_funds) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    destroy_frozen_funds.public_note(),
                    owner_id,
                    Some(destroy_frozen_funds.frozen_identity_id()),
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::EmergencyAction(emergency_action) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    emergency_action.public_note(),
                    owner_id,
                    None,
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::ConfigUpdate(config_update) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    config_update.public_note(),
                    owner_id,
                    None,
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::Claim(claim) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    claim.public_note(),
                    owner_id,
                    None,
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::DirectPurchase(purchase) => self
                .dao
                .token_transition(
                    transition.clone(),
                    Some(purchase.token_count()),
                    None,
                    owner_id,
                    None,
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
            TokenTransition::SetPriceForDirectPurchase(set_price) => self
                .dao
                .token_transition(
                    transition.clone(),
                    None,
                    set_price.public_note(),
                    owner_id,
                    None,
                    st_hash.clone(),
                    sql_transaction,
                )
                .await
                .unwrap(),
        }
    }
}
