use crate::entities::identity::Identity;
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use dashcore_rpc::dashcore::{ProTxHash, Txid};
use dashcore_rpc::json::ProTxInfo;
use dashcore_rpc::RpcApi;
use deadpool_postgres::Transaction;

impl PSQLProcessor {
    // Core drops masternodes that have left the list, so their state is resolved from the
    // block the ProRegTx was mined in, the way handle_masternode_vote does it
    fn get_pro_tx_info(&self, pro_tx_hash: &String) -> Option<ProTxInfo> {
        let hash = ProTxHash::from_hex(pro_tx_hash).ok()?;

        if let Ok(pro_tx_info) = self.dashcore_rpc.get_protx_info(&hash, None) {
            return Some(pro_tx_info);
        }

        let raw_tx = self
            .dashcore_rpc
            .get_raw_transaction_info(&Txid::from_hex(pro_tx_hash).ok()?, None)
            .ok()?;

        self.dashcore_rpc
            .get_protx_info(&hash, Some(&raw_tx.blockhash?))
            .ok()
    }

    pub async fn handle_validator(
        &self,
        validator: Validator,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), ProcessorError> {
        let existing = self
            .dao
            .get_validator_by_pro_tx_hash(validator.pro_tx_hash.clone(), sql_transaction)
            .await?;

        match existing {
            None => {
                self.dao
                    .create_validator(validator.clone(), sql_transaction)
                    .await?;

                let pro_tx_hash = validator.pro_tx_hash.clone();

                self.dao
                    .create_identity(Identity::from(validator), None, sql_transaction)
                    .await?;

                // the voting and operator identities need the masternode keys, without them
                // only the owner identity is indexed rather than failing the whole block
                match self.get_pro_tx_info(&pro_tx_hash) {
                    Some(pro_tx_info) => {
                        for identity in
                            Identity::masternode_key_identities(&pro_tx_hash, &pro_tx_info.state)
                        {
                            self.dao
                                .create_identity(identity, None, sql_transaction)
                                .await?;
                        }
                    }
                    None => {
                        println!(
                            "Could not resolve ProTx info for {}, its voting and operator identities are not indexed",
                            &pro_tx_hash
                        );
                    }
                }

                Ok(())
            }
            Some(_) => Ok(()),
        }
    }
}
