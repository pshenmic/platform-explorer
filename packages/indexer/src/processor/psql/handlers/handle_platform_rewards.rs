use crate::entities::block_header::BlockHeader;
use crate::entities::platform_reward::PlatformReward;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use dapi_grpc::platform::v0::get_finalized_epoch_infos_request::{
    GetFinalizedEpochInfosRequestV0, Version as RequestVersion,
};
use dapi_grpc::platform::v0::get_finalized_epoch_infos_response::get_finalized_epoch_infos_response_v0::Result as FinalizedEpochInfosResult;
use dapi_grpc::platform::v0::get_finalized_epoch_infos_response::Version as ResponseVersion;
use dapi_grpc::platform::v0::GetFinalizedEpochInfosRequest;
use deadpool_postgres::Transaction;

impl PSQLProcessor {
    // The first block of every epoch pays the proposers of the previous one,
    // Platform keeps the finalized info of the paid epochs since protocol version 9
    pub async fn handle_platform_rewards(
        &self,
        block_header: &BlockHeader,
        previous_block_header: Option<&BlockHeader>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), ProcessorError> {
        let paid_epoch = match previous_block_header.and_then(|header| header.epoch) {
            Some(previous_epoch) if Some(previous_epoch) != block_header.epoch => previous_epoch,
            _ => return Ok(()),
        };

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

        if platform_height < block_header.height as u64 {
            println!(
                "DAPI is at the height {} behind the block {}",
                platform_height, block_header.height
            );

            return Err(ProcessorError::UnexpectedError);
        }

        let Some(FinalizedEpochInfosResult::Epochs(epochs)) = response.result else {
            return Err(ProcessorError::UnexpectedError);
        };

        for epoch_info in epochs.finalized_epoch_infos {
            for platform_reward in
                PlatformReward::epoch_proposer_rewards(block_header.height, &epoch_info)
            {
                self.dao
                    .create_platform_reward(platform_reward, sql_transaction)
                    .await?;
            }
        }

        Ok(())
    }
}
