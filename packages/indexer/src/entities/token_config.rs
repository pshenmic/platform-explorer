use dpp::data_contract::associated_token::token_distribution_rules::TokenDistributionRules;
use dpp::data_contract::change_control_rules::ChangeControlRules;
use dpp::identifier::Identifier;

#[derive(Clone)]
pub struct TokenConfig {
  pub position: u16,
  pub identifier: Identifier,
  pub data_contract_identifier: Identifier,
  pub max_supply: Option<u64>,
  pub base_supply: u64,
  pub keeps_history: bool,
  pub distribution_rules: TokenDistributionRules,
  pub manual_minting_rules: ChangeControlRules,
  pub manual_burning_rules: ChangeControlRules,
  pub freeze_rules: ChangeControlRules,
  pub unfreeze_rules: ChangeControlRules,
  pub destroy_frozen_funds_rules: ChangeControlRules,
  pub emergency_action_rules: ChangeControlRules
}

// impl From<IdentityTopUpTransition> for TokenConfig {
//   fn from(token: Token) -> Self {
//
//     return Token {
//       id: None,
//       sender: None,
//       recipient: Some(identifier),
//       amount
//     };
//   }
// }
//
// impl From<IdentityCreditWithdrawalTransition> for Transfer {
//   fn from(state_transition: IdentityCreditWithdrawalTransition) -> Self {
//     let identifier = state_transition.identity_id().clone();
//     let amount = state_transition.amount();
//
//     return Transfer {
//       id: None,
//       sender: Some(identifier),
//       recipient: None,
//       amount
//     };
//   }
// }

// impl From<IdentityCreditTransferTransition> for Transfer {
//   fn from(state_transition: IdentityCreditTransferTransition) -> Self {
//     let sender = state_transition.identity_id().clone();
//     let recipient = state_transition.recipient_id().clone();
//     let amount = state_transition.amount();
//
//     return Transfer {
//       id: None,
//       sender: Some(sender),
//       recipient: Some(recipient),
//       amount
//     };
//   }
// }

