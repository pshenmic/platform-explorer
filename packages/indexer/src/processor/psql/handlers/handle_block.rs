use crate::entities::block::Block;
use crate::entities::block_header::BlockHeader;
use crate::entities::core_payment::CorePayment;
use crate::entities::platform_reward::PlatformReward;
use crate::entities::validator::Validator;
use crate::processor::psql::{epoch_time_length, PSQLProcessor, ProcessorError};
use base64::engine::general_purpose;
use base64::Engine;
use dapi_grpc::platform::v0::get_finalized_epoch_infos_request::{
    GetFinalizedEpochInfosRequestV0, Version as RequestVersion,
};
use dapi_grpc::platform::v0::get_finalized_epoch_infos_response::get_finalized_epoch_infos_response_v0::Result as FinalizedEpochInfosResult;
use dapi_grpc::platform::v0::get_finalized_epoch_infos_response::Version as ResponseVersion;
use dapi_grpc::platform::v0::GetFinalizedEpochInfosRequest;
use dashcore_rpc::RpcApi;
use deadpool_postgres::{GenericClient, Transaction};
use std::cmp::min;

// Core answers 1000 blocks of masternode payments in about half a second
const CORE_PAYMENTS_PAGE: usize = 1000;

impl PSQLProcessor {
    pub async fn handle_block(
        &self,
        block: Block,
        validators: Vec<Validator>,
    ) -> Result<(), ProcessorError> {
        let processed = self
            .dao
            .get_block_header_by_height(block.header.height.clone())
            .await?;

        match processed {
            None => {
                let block_height = block.header.height.clone();

                let mut client = self.dao.connection_pool.get().await.unwrap();
                let sql_transaction = client.transaction().await.unwrap();

                if block.header.height == 1 {
                    let mut init_client = self.dao.connection_pool.get().await.unwrap();

                    let init_sql_transaction = init_client.transaction().await.unwrap();

                    self.handle_init_chain(&init_sql_transaction).await;

                    init_sql_transaction
                        .commit()
                        .await
                        .expect("Cannot create initial data");
                }

                for (_, validator) in validators.iter().enumerate() {
                    self.handle_validator(validator.clone(), &sql_transaction)
                        .await?;
                }

                let previous_block_header = match block.header.height {
                    1 => None,
                    height => Some(
                        self.dao
                            .get_block_header_by_height(height - 1)
                            .await?
                            .expect("Previous block must be indexed"),
                    ),
                };

                let genesis_time = match block.header.height {
                    1 => block.header.timestamp,
                    _ => {
                        self.dao
                            .get_block_header_by_height(1)
                            .await?
                            .expect("Genesis block must be indexed")
                            .timestamp
                    }
                };

                let epoch = (block.header.timestamp - genesis_time).num_milliseconds()
                    / epoch_time_length(self.network);

                let block_hash = self
                    .dao
                    .create_block(
                        BlockHeader {
                            epoch: Some(epoch as i32),
                            ..block.header.clone()
                        },
                        &sql_transaction,
                    )
                    .await;

                self.handle_core_payments(
                    &block.header,
                    previous_block_header.as_ref(),
                    &sql_transaction,
                )
                .await?;

                // the first block of every epoch pays the proposers of the previous one
                if let Some(paid_epoch) = previous_block_header
                    .and_then(|previous_block_header| previous_block_header.epoch)
                    .filter(|previous_epoch| *previous_epoch != epoch as i32)
                {
                    self.handle_platform_rewards(block_height, paid_epoch, &sql_transaction)
                        .await?;
                }

                if block.txs.len() as i32 == 0 {
                    println!(
                        "No platform transactions at block height {}",
                        block_height.clone()
                    );
                }

                println!("Processing block at height {}", block_height.clone());
                for (i, tx) in block.txs.iter().enumerate() {
                    let bytes = general_purpose::STANDARD.decode(tx.data.clone()).unwrap();
                    let st_result = self.decoder.decode(bytes).await;

                    let state_transition = st_result.unwrap();

                    self.handle_st(
                        block_hash.clone(),
                        block.header.height,
                        i as u32,
                        state_transition,
                        tx.clone(),
                        &sql_transaction,
                    )
                    .await;
                }

                sql_transaction
                    .commit()
                    .await
                    .expect("SQL Transaction Error");

                Ok(())
            }
            Some(_) => {
                println!(
                    "Block at the height {} has been already processed",
                    &block.header.height
                );
                Ok(())
            }
        }
    }

    // Indexes the masternode payments of the Core blocks the block chain locks on top of the
    // previous block. Chain locked Core blocks are final, so their payments never change.
    async fn handle_core_payments(
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
    // Platform keeps the finalized info of the paid epochs since protocol version 9, the rewards
    // of the epochs paid before are not indexed
    async fn handle_platform_rewards(
        &self,
        block_height: i32,
        paid_epoch: i32,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), ProcessorError> {
        let request = GetFinalizedEpochInfosRequest {
            version: Some(RequestVersion::V0(GetFinalizedEpochInfosRequestV0 {
                start_epoch_index: paid_epoch as u32,
                start_epoch_index_included: true,
                end_epoch_index: paid_epoch as u32,
                end_epoch_index_included: true,
                prove: false,
            })),
        };

        let response = self
            .dapi_client
            .clone()
            .get_finalized_epoch_infos(request)
            .await?
            .into_inner();

        let Some(ResponseVersion::V0(response)) = response.version else {
            return Err(ProcessorError::UnexpectedError);
        };

        // a node that has not processed the block yet does not know the epoch was paid
        let platform_height = response.metadata.map_or(0, |metadata| metadata.height);

        if platform_height < block_height as u64 {
            println!(
                "DAPI is at the height {} behind the block {}",
                platform_height, block_height
            );

            return Err(ProcessorError::UnexpectedError);
        }

        let Some(FinalizedEpochInfosResult::Epochs(epochs)) = response.result else {
            return Err(ProcessorError::UnexpectedError);
        };

        for epoch_info in epochs.finalized_epoch_infos {
            for platform_reward in PlatformReward::epoch_proposer_rewards(block_height, &epoch_info)
            {
                self.dao
                    .create_platform_reward(platform_reward, sql_transaction)
                    .await?;
            }
        }

        Ok(())
    }
}
