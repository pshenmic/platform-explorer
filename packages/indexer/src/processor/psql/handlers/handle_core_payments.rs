use crate::entities::block_header::BlockHeader;
use crate::entities::core_payment::CorePayment;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use dashcore_rpc::RpcApi;
use deadpool_postgres::Transaction;
use std::cmp::min;

// Core blocks per masternode payments request
const CORE_PAYMENTS_PAGE: usize = 1000;

impl PSQLProcessor {
    // Indexes the masternode payments of the Core blocks the block chain locks on top of the
    // previous block. Chain locked Core blocks are final, so their payments never change.
    pub async fn handle_core_payments(
        &self,
        block_header: &BlockHeader,
        previous_block_header: Option<&BlockHeader>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), ProcessorError> {
        let start_height = match previous_block_header {
            None => block_header.l1_locked_height,
            Some(previous_block_header) => previous_block_header.l1_locked_height + 1,
        };

        // after a Platform halt a block can chain lock tens of thousands of Core blocks, which
        // do not fit into the Core RPC timeout at once
        for page_start in (start_height..=block_header.l1_locked_height).step_by(CORE_PAYMENTS_PAGE)
        {
            let count = min(
                CORE_PAYMENTS_PAGE as i32,
                block_header.l1_locked_height - page_start + 1,
            );

            let block_hash = self.dashcore_rpc.get_block_hash(page_start as u32)?;

            let blocks = self
                .dashcore_rpc
                .get_masternode_payments(Some(&block_hash.to_string()), Some(&count.to_string()))?;

            for block in blocks {
                for masternode in block.masternodes {
                    self.dao
                        .create_core_payment(
                            CorePayment::from((block.height, masternode)),
                            sql_transaction,
                        )
                        .await?;
                }
            }
        }

        Ok(())
    }
}
