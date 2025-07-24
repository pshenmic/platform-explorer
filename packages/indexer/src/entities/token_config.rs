use dpp::data_contract::associated_token::token_configuration_localization::TokenConfigurationLocalization;
use dpp::data_contract::associated_token::token_distribution_rules::TokenDistributionRules;
use dpp::identifier::Identifier;
use std::collections::BTreeMap;

#[derive(Clone)]
pub struct TokenConfig {
    pub state_transition_hash: Option<String>,
    pub position: u16,
    pub identifier: Identifier,
    pub data_contract_identifier: Identifier,
    pub owner: Identifier,
    pub decimals: u8,
    pub max_supply: Option<u64>,
    pub base_supply: u64,
    pub localizations: BTreeMap<String, TokenConfigurationLocalization>,
    pub keeps_transfer_history: bool,
    pub keeps_freezing_history: bool,
    pub keeps_minting_history: bool,
    pub keeps_burning_history: bool,
    pub keeps_direct_pricing_history: bool,
    pub keeps_direct_purchase_history: bool,
    pub distribution_rules: TokenDistributionRules,
    pub mintable: bool,
    pub burnable: bool,
    pub freezable: bool,
    pub unfreezable: bool,
    pub destroyable: bool,
    pub allowed_emergency_actions: bool,
    pub description: Option<String>,
    pub name: String,
}
