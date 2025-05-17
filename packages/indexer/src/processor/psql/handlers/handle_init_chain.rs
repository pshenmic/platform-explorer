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

        println!("Processing SystemDataContract::FeatureFlags");
        self.process_system_data_contract(SystemDataContract::FeatureFlags, sql_transaction)
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

        println!("Finished initChain processing");
    }
}
