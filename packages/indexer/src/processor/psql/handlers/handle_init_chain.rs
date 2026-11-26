use crate::processor::psql::PSQLProcessor;
use data_contracts::SystemDataContract;
use deadpool_postgres::Transaction;

// FeatureFlags is a reserved slot and the token market is registered from protocol version 16
const SYSTEM_DATA_CONTRACTS: [SystemDataContract; 11] = [
    SystemDataContract::Withdrawals,
    SystemDataContract::MasternodeRewards,
    SystemDataContract::DPNS,
    SystemDataContract::Dashpay,
    SystemDataContract::WalletUtils,
    SystemDataContract::TokenHistory,
    SystemDataContract::KeywordSearch,
    SystemDataContract::DocumentHistory,
    SystemDataContract::AppConnect,
    SystemDataContract::ModerationCharters,
    SystemDataContract::DecisionProposals,
];

impl PSQLProcessor {
    pub async fn ensure_system_data_contracts(&self) {
        let mut client = self.dao.connection_pool.get().await.unwrap();
        let sql_transaction = client.transaction().await.unwrap();

        self.ensure_system_data_contracts_in_transaction(&sql_transaction)
            .await;

        sql_transaction
            .commit()
            .await
            .expect("Cannot create missing system data contracts");
    }

    pub async fn handle_init_chain(&self, sql_transaction: &Transaction<'_>) -> () {
        println!("Processing initChain");

        self.ensure_system_data_contracts_in_transaction(sql_transaction)
            .await;

        println!("Processing state transition duplicates");
        self.process_state_transition_duplicates(sql_transaction)
            .await;

        println!("Finished initChain processing");
    }

    // A chain upgraded to a newer protocol version registers system data contracts the running
    // indexer database does not have yet, so registering only at genesis would miss them
    async fn ensure_system_data_contracts_in_transaction(&self, sql_transaction: &Transaction<'_>) {
        for system_data_contract in SYSTEM_DATA_CONTRACTS {
            let existing = self
                .dao
                .get_data_contract_by_identifier(system_data_contract.id(), sql_transaction)
                .await
                .unwrap();

            if existing.is_some() {
                continue;
            }

            println!("Processing SystemDataContract::{:?}", system_data_contract);

            self.process_system_data_contract(system_data_contract, sql_transaction)
                .await;
        }
    }
}
