use crate::entities::masternode_vote::MasternodeVote;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use dashcore_rpc::dashcore::{ProTxHash, Txid};
use dashcore_rpc::RpcApi;
use deadpool_postgres::Transaction;
use dpp::platform_value::string_encoding::Encoding::Hex;
use dpp::state_transition::masternode_vote_transition::accessors::MasternodeVoteTransitionAccessorsV0;
use dpp::state_transition::masternode_vote_transition::MasternodeVoteTransition;

impl PSQLProcessor {
    pub async fn handle_masternode_vote(
        &self,
        state_transition: MasternodeVoteTransition,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), ProcessorError> {
        let pro_tx_hash = state_transition.pro_tx_hash().to_string(Hex);

        let raw_tx = self
            .dashcore_rpc
            .get_raw_transaction_info(&Txid::from_hex(&pro_tx_hash.to_string()).unwrap(), None)
            .unwrap();

        let block_hash = raw_tx.blockhash.unwrap();

        let pro_tx_info = self
            .dashcore_rpc
            .get_protx_info(
                &ProTxHash::from_hex(&pro_tx_hash.to_string()).unwrap(),
                Some(&block_hash),
            )
            .unwrap();

        let masternode_vote = MasternodeVote::from((state_transition, pro_tx_info));

        self.dao
            .create_masternode_vote(masternode_vote, st_hash.clone(), sql_transaction)
            .await
            .unwrap();

        Ok(())
    }
}
