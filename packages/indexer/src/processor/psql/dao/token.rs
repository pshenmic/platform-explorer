use deadpool_postgres::{PoolError, Transaction};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::state_transition::batch_transition::batched_transition::token_transition::{TokenTransition, TokenTransitionV0Methods};
use dpp::state_transition::batch_transition::batched_transition::token_transition_action_type::TokenTransitionActionTypeGetter;
use dpp::state_transition::batch_transition::token_base_transition::v0::v0_methods::TokenBaseTransitionV0Methods;
use crate::entities::token_config::TokenConfig;
use crate::processor::psql::dao::PostgresDAO;

impl PostgresDAO {
  pub async fn create_token(&self, token: TokenConfig, sql_transaction: &Transaction<'_>) {

    let max_supply = match token.max_supply {
      None => None,
      Some(supply) => Some(supply as i64),
    };

    let distribution_rules = serde_json::to_value(token.distribution_rules).unwrap();
    let manual_minting_rules = serde_json::to_value(token.manual_minting_rules).unwrap();
    let manual_burning_rules = serde_json::to_value(token.manual_burning_rules).unwrap();
    let freeze_rules = serde_json::to_value(token.freeze_rules).unwrap();
    let unfreeze_rules = serde_json::to_value(token.unfreeze_rules).unwrap();
    let destroy_frozen_funds_rules = serde_json::to_value(token.destroy_frozen_funds_rules).unwrap();
    let emergency_action_rules = serde_json::to_value(token.emergency_action_rules).unwrap();

    let data_contract = self
      .get_data_contract_by_identifier(token.data_contract_identifier, sql_transaction)
      .await.unwrap().expect(&format!("Could not find DataContract with identifier {}",
                                      token.data_contract_identifier.to_string(Base58)));
    let data_contract_id = data_contract.id.unwrap() as i32;

    let query = "INSERT INTO tokens(position, identifier, data_contract_id, max_supply, base_supply, \
        keeps_transfer_history, keeps_freezing_history, keeps_minting_history, keeps_burning_history, \
        keeps_direct_pricing_history, keeps_direct_purchase_history, \
        distribution_rules, manual_minting_rules, manual_burning_rules, freeze_rules, unfreeze_rules, destroy_frozen_funds_rules, \
        emergency_action_rules) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);";

    let stmt = sql_transaction.prepare_cached(query).await.unwrap();

    sql_transaction.query(&stmt, &[
      &(token.position as i16),
      &(token.identifier.to_string(Base58)),
      &data_contract_id,
      &(max_supply),
      &(token.base_supply as i64),
      &token.keeps_transfer_history,
      &token.keeps_freezing_history,
      &token.keeps_minting_history,
      &token.keeps_burning_history,
      &token.keeps_direct_pricing_history,
      &token.keeps_direct_purchase_history,
      &distribution_rules,
      &manual_minting_rules,
      &manual_burning_rules,
      &freeze_rules,
      &unfreeze_rules,
      &destroy_frozen_funds_rules,
      &emergency_action_rules
    ]).await.unwrap();

    println!("Created Token from contract {} wit position {}", token.data_contract_identifier.to_string(Base58), token.position);
  }

  pub async fn token_transition(&self, token_transition: TokenTransition, amount: Option<u64>, public_note: Option<&String>, owner: Identifier, recipient: Option<Identifier>, st_hash: String, sql_transaction: &Transaction<'_>) -> Result<(), PoolError> {
    let data_contract = self
      .get_data_contract_by_identifier(token_transition.base().data_contract_id(), sql_transaction)
      .await.unwrap().expect(&format!("Could not find DataContract with identifier {}",
                                      token_transition.base().data_contract_id().to_string(Base58)));
    let data_contract_id = data_contract.id.unwrap() as i32;

    let token_position = token_transition.base().token_contract_position();

    let action = token_transition.action_type();

    let token_identifier = token_transition.token_id();

    let query = "INSERT INTO token_transitions \
          (owner, token_identifier, action, amount, public_note, token_contract_position, state_transition_hash, data_contract_id, recipient) \
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";

    let stmt = sql_transaction.prepare_cached(query).await.unwrap();

    sql_transaction.query(&stmt, &[
      &owner.to_string(Base58),
      &token_identifier.to_string(Base58),
      &(action as i16),
      &(amount.unwrap() as i64),
      &public_note,
      &(token_position as i16),
      &st_hash,
      &data_contract_id,
      &recipient.unwrap().to_string(Base58)
    ]).await.unwrap();

    println!("Token transition from {}", &owner.to_string(Base58));

    Ok(())
  }
}