use crate::entities::block_header::BlockHeader;
use crate::entities::core_payment::CorePayment;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use dashcore_rpc::json::GetMasternodePaymentsResult;
use dashcore_rpc::RpcApi;
use deadpool_postgres::Transaction;
use std::cmp::{max, min};

// Core blocks per masternode payments request
const CORE_PAYMENTS_PAGE: i32 = 50;

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

        for core_block_height in start_height..=block_header.l1_locked_height {
            let block = self.get_core_block_payments(core_block_height)?;

            for masternode in block.masternodes {
                self.dao
                    .create_core_payment(
                        CorePayment::from((block.height, masternode)),
                        sql_transaction,
                    )
                    .await?;
            }
        }

        Ok(())
    }

    // Platform chain locks a few Core blocks at a time, so the payments are requested a page
    // ahead up to the best chain lock rather than with two Core RPC calls for every block
    fn get_core_block_payments(
        &self,
        core_block_height: i32,
    ) -> Result<GetMasternodePaymentsResult, ProcessorError> {
        let mut core_payments = self.core_payments.borrow_mut();

        while core_payments
            .front()
            .is_some_and(|block| (block.height as i32) < core_block_height)
        {
            core_payments.pop_front();
        }

        if core_payments
            .front()
            .is_none_or(|block| block.height as i32 != core_block_height)
        {
            let best_chain_lock_height = self.dashcore_rpc.get_best_chain_lock()?.block_height;

            // after a Platform halt a block can chain lock tens of thousands of Core blocks,
            // which do not fit into the Core RPC timeout at once
            let count = min(
                CORE_PAYMENTS_PAGE,
                max(best_chain_lock_height as i32 - core_block_height + 1, 1),
            );

            let block_hash = self.dashcore_rpc.get_block_hash(core_block_height as u32)?;

            // Core v24 rejects a string count, which get_masternode_payments always sends
            *core_payments = self
                .dashcore_rpc
                .call::<Vec<GetMasternodePaymentsResult>>(
                    "masternode",
                    &[
                        "payments".into(),
                        block_hash.to_string().into(),
                        count.into(),
                    ],
                )?
                .into();
        }

        match core_payments.pop_front() {
            Some(block) if block.height as i32 == core_block_height => Ok(block),
            _ => Err(ProcessorError::UnexpectedError),
        }
    }
}
