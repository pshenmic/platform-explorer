use dapi_grpc::platform::v0::get_finalized_epoch_infos_response::get_finalized_epoch_infos_response_v0::FinalizedEpochInfo;

#[derive(Clone, Debug, PartialEq)]
pub struct PlatformReward {
    pub block_height: i32,
    pub epoch: i32,
    pub pro_tx_hash: String,
    pub amount: i64,
}

impl PlatformReward {
    // Drive pays the epoch pool to the proposers by the share of the epoch blocks they proposed,
    // in the order of their ProTxHash, the last one also gets what is left after the rounding
    pub fn epoch_proposer_rewards(
        block_height: i32,
        epoch_info: &FinalizedEpochInfo,
    ) -> Vec<PlatformReward> {
        let total_payouts = epoch_info.total_processing_fees
            + epoch_info.total_distributed_storage_fees
            + epoch_info.core_block_rewards;

        let mut proposers = epoch_info.block_proposers.clone();

        proposers.sort_by(|a, b| a.proposer_id.cmp(&b.proposer_id));

        let mut remaining_payouts = total_payouts;

        proposers
            .iter()
            .enumerate()
            .map(|(i, proposer)| {
                let payout =
                    total_payouts * proposer.block_count as u64 / epoch_info.total_blocks_in_epoch;

                remaining_payouts -= payout;

                let amount = match i == proposers.len() - 1 {
                    true => payout + remaining_payouts,
                    false => payout,
                };

                PlatformReward {
                    block_height,
                    epoch: epoch_info.number as i32,
                    pro_tx_hash: hex::encode_upper(&proposer.proposer_id),
                    amount: amount as i64,
                }
            })
            .collect()
    }
}
