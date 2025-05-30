use deadpool_postgres::Transaction;
use crate::entities::data_contract::DataContract;
use crate::entities::token_config::TokenConfig;
use crate::processor::psql::PSQLProcessor;
use dpp::data_contract::associated_token::token_configuration::accessors::v0::TokenConfigurationV0Getters;
use dpp::data_contract::associated_token::token_keeps_history_rules::accessors::v0::TokenKeepsHistoryRulesV0Getters;
use dpp::identifier::Identifier;
use dpp::tokens::calculate_token_id;

impl PSQLProcessor {
    pub async fn handle_token_configuration(&self, data_contract: DataContract, sql_transaction: &Transaction<'_>) -> () {
        if data_contract.tokens.is_some() {
            let tokens = data_contract.tokens.clone().unwrap();

            for (k, v) in tokens {
                let token_id = calculate_token_id(data_contract.identifier.as_bytes(), k);

                let keeps_history = v.keeps_history();

                let token = TokenConfig {
                    position: k,
                    identifier: Identifier::new(token_id),
                    data_contract_identifier: data_contract.identifier,
                    max_supply: v.max_supply(),
                    base_supply: v.base_supply(),
                    keeps_transfer_history: keeps_history.keeps_transfer_history(),
                    keeps_freezing_history: keeps_history.keeps_freezing_history(),
                    keeps_minting_history: keeps_history.keeps_minting_history(),
                    keeps_burning_history: keeps_history.keeps_burning_history(),
                    keeps_direct_pricing_history: keeps_history.keeps_direct_pricing_history(),
                    keeps_direct_purchase_history: keeps_history.keeps_direct_purchase_history(),
                    distribution_rules: v.distribution_rules().clone(),
                    manual_minting_rules: v.manual_minting_rules().clone(),
                    manual_burning_rules: v.manual_burning_rules().clone(),
                    freeze_rules: v.freeze_rules().clone(),
                    unfreeze_rules: v.unfreeze_rules().clone(),
                    destroy_frozen_funds_rules: v.destroy_frozen_funds_rules().clone(),
                    emergency_action_rules: v.emergency_action_rules().clone(),
                };

                self.dao.create_token(token, sql_transaction).await;
            }
        }
    }
}
