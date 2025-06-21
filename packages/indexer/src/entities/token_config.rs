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
    pub keeps_transfer_history: bool,
    pub keeps_freezing_history: bool,
    pub keeps_minting_history: bool,
    pub keeps_burning_history: bool,
    pub keeps_direct_pricing_history: bool,
    pub keeps_direct_purchase_history: bool,
    pub distribution_rules: TokenDistributionRules,
    pub manual_minting_rules: ChangeControlRules,
    pub manual_burning_rules: ChangeControlRules,
    pub freeze_rules: ChangeControlRules,
    pub unfreeze_rules: ChangeControlRules,
    pub destroy_frozen_funds_rules: ChangeControlRules,
    pub emergency_action_rules: ChangeControlRules,
}
