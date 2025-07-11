use crate::entities::identity::Identity;
use crate::entities::transfer::Transfer;
use crate::processor::psql::PSQLProcessor;
use dashcore_rpc::dashcore::Txid;
use dashcore_rpc::RpcApi;
use deadpool_postgres::Transaction;
use dpp::identity::state_transition::AssetLockProved;
use dpp::prelude::AssetLockProof;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_credit_transfer_transition::IdentityCreditTransferTransition;
use dpp::state_transition::identity_credit_withdrawal_transition::IdentityCreditWithdrawalTransition;
use dpp::state_transition::identity_topup_transition::IdentityTopUpTransition;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;

impl PSQLProcessor {
    pub async fn handle_identity_create(
        &self,
        state_transition: IdentityCreateTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let asset_lock = state_transition.asset_lock_proof().clone();

        let transaction = match asset_lock {
            AssetLockProof::Instant(instant_lock) => instant_lock.transaction,
            AssetLockProof::Chain(chain_lock) => {
                let tx_hash = chain_lock.out_point.txid.to_string();

                let transaction_info = self
                    .dashcore_rpc
                    .get_raw_transaction_info(&Txid::from_hex(&tx_hash).unwrap(), None)
                    .unwrap();

                if transaction_info.height.is_some()
                    && transaction_info.height.unwrap() as u32 > chain_lock.core_chain_locked_height
                {
                    panic!("Transaction {} was mined after chain lock", &tx_hash)
                }

                let transaction = self
                    .dashcore_rpc
                    .get_raw_transaction(&Txid::from_hex(&tx_hash).unwrap(), None)
                    .unwrap();

                transaction
            }
        };

        let identity = Identity::from((state_transition, transaction));

        let transfer = Transfer {
            sender: None,
            recipient: Some(identity.identifier),
            amount: identity.balance.expect("Balance missing from identity"),
        };

        self.dao
            .create_identity(identity, Some(st_hash.clone()), sql_transaction)
            .await
            .unwrap();
        self.dao
            .create_transfer(transfer, st_hash.clone(), sql_transaction)
            .await
            .unwrap();
    }

    pub async fn handle_identity_update(
        &self,
        state_transition: IdentityUpdateTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let identity = Identity::from(state_transition);

        self.dao
            .create_identity(identity, Some(st_hash.clone()), sql_transaction)
            .await
            .unwrap();
    }

    pub async fn handle_identity_top_up(
        &self,
        state_transition: IdentityTopUpTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao
            .create_transfer(transfer, st_hash.clone(), sql_transaction)
            .await
            .unwrap();
    }

    pub async fn handle_identity_credit_withdrawal(
        &self,
        state_transition: IdentityCreditWithdrawalTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao
            .create_transfer(transfer, st_hash.clone(), sql_transaction)
            .await
            .unwrap();
    }

    pub async fn handle_identity_credit_transfer(
        &self,
        state_transition: IdentityCreditTransferTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let transfer = Transfer::from(state_transition);

        self.dao
            .create_transfer(transfer, st_hash.clone(), sql_transaction)
            .await
            .unwrap();
    }
}
