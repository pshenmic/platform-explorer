use data_contracts::SystemDataContract;
use crate::processor::psql::PSQLProcessor;

impl PSQLProcessor {
  pub async fn handle_init_chain(&self) -> () {
    println!("Processing initChain");

    println!("Processing SystemDataContract::Withdrawals");
    self.process_system_data_contract(SystemDataContract::Withdrawals).await;

    println!("Processing SystemDataContract::MasternodeRewards");
    self.process_system_data_contract(SystemDataContract::MasternodeRewards).await;

    println!("Processing SystemDataContract::FeatureFlags");
    self.process_system_data_contract(SystemDataContract::FeatureFlags).await;

    println!("Processing SystemDataContract::DPNS");
    self.process_system_data_contract(SystemDataContract::DPNS).await;

    println!("Processing SystemDataContract::Dashpay");
    self.process_system_data_contract(SystemDataContract::Dashpay).await;

    println!("Processing SystemDataContract::WalletUtils");
    self.process_system_data_contract(SystemDataContract::WalletUtils).await;

    println!("Finished initChain processing");
  }
}