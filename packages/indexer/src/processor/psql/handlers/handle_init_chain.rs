use crate::processor::psql::PSQLProcessor;
use data_contracts::SystemDataContract;
use deadpool_postgres::Transaction;

impl PSQLProcessor {
    pub async fn handle_init_chain(&self, sql_transaction: &Transaction<'_>) -> () {
        println!("Processing initChain");

        println!("Processing SystemDataContract::Withdrawals");
        self.process_system_data_contract(SystemDataContract::Withdrawals, sql_transaction)
            .await;

        println!("Processing SystemDataContract::MasternodeRewards");
        self.process_system_data_contract(SystemDataContract::MasternodeRewards, sql_transaction)
            .await;

        println!("Processing SystemDataContract::DPNS");
        self.process_system_data_contract(SystemDataContract::DPNS, sql_transaction)
            .await;

        println!("Processing SystemDataContract::Dashpay");
        self.process_system_data_contract(SystemDataContract::Dashpay, sql_transaction)
            .await;

        println!("Processing SystemDataContract::WalletUtils");
        self.process_system_data_contract(SystemDataContract::WalletUtils, sql_transaction)
            .await;

        println!("Processing SystemDataContract::TokenHistory");
        self.process_system_data_contract(SystemDataContract::TokenHistory, sql_transaction)
            .await;

        println!("Processing SystemDataContract::KeywordSearch");
        self.process_system_data_contract(SystemDataContract::KeywordSearch, sql_transaction)
            .await;

        println!("Processing SystemDataContract::DocumentHistory");
        self.process_system_data_contract(SystemDataContract::DocumentHistory, sql_transaction)
            .await;

        println!("Processing SystemDataContract::AppConnect");
        self.process_system_data_contract(SystemDataContract::AppConnect, sql_transaction)
            .await;

        println!("Processing SystemDataContract::ModerationCharters");
        self.process_system_data_contract(SystemDataContract::ModerationCharters, sql_transaction)
            .await;

        println!("Processing state transition duplicates");
        self.process_state_transition_duplicates(sql_transaction).await;

        println!("Finished initChain processing");
    }
}
