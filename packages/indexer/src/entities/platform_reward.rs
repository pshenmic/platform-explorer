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

#[cfg(test)]
mod tests {
    use super::*;
    use dapi_grpc::platform::v0::get_finalized_epoch_infos_response::get_finalized_epoch_infos_response_v0::BlockProposer;

    fn block_proposer(pro_tx_hash: &str, block_count: u32) -> BlockProposer {
        BlockProposer {
            proposer_id: hex::decode(pro_tx_hash).unwrap(),
            block_count,
        }
    }

    // testnet epoch 8628
    #[test]
    fn pays_the_epoch_pool_by_proposed_blocks() {
        let epoch_info = FinalizedEpochInfo {
            number: 8628,
            first_block_height: 152867,
            first_core_block_height: 1287772,
            first_block_time: 1752414071493,
            fee_multiplier: 1.0,
            protocol_version: 9,
            total_blocks_in_epoch: 39,
            next_epoch_start_core_block_height: 1287797,
            total_processing_fees: 24003945190,
            total_distributed_storage_fees: 6582972,
            total_created_storage_fees: 136917760,
            core_block_rewards: 1875071229564,
            block_proposers: vec![
                block_proposer(
                    "FF261D2C1C76907A2AD8AEB6C5611796F03B5CBD88AE92452A4727E13F4F4AC9",
                    2,
                ),
                block_proposer(
                    "143DCD6A6B7684FDE01E88A10E5D65DE9A29244C5ECD586D14A342657025F113",
                    2,
                ),
                block_proposer(
                    "2E48651A2E9C0CB4F2FB7AB874061AA4AF0CD28B59695631E6A35AF3950EF6FB",
                    2,
                ),
                block_proposer(
                    "39741AD83DD791E1E738F19EDAE82D6C0322972E6A455981424DA3769B3DBD4A",
                    2,
                ),
                block_proposer(
                    "40784F3F9A761C60156F9244A902C0626F8BC8FE003786C70F1FC6BE41DA467D",
                    2,
                ),
                block_proposer(
                    "5C6542766615387183715D958A925552472F93335FA1612880423E4BBDAEF436",
                    2,
                ),
                block_proposer(
                    "61D33F478933797BE4DE88353C7C2D843C21310F6D00F6EFF31424A756EE7DFB",
                    2,
                ),
                block_proposer(
                    "6D1B185BA036EFCD44A77E05A9AAF69A0C4E40976AEC00B04773E52863320966",
                    1,
                ),
                block_proposer(
                    "7718EDAD371E46D20FAD30086E4ACF4A05C2B660DF6AE5F2A684AEBDF1BE4290",
                    1,
                ),
                block_proposer(
                    "87075234AC47353B42BB97CE46330CB67CD4648C01F0B2393D7E729B0D678918",
                    1,
                ),
                block_proposer(
                    "88251BD4B124EFEB87537DEABEEC54F6C8F575F4DF81F10CF5E8EEA073092B6F",
                    2,
                ),
                block_proposer(
                    "8917BB546318F3410D1A7901C7B846A73446311B5164B45A03F0E613F208F234",
                    2,
                ),
                block_proposer(
                    "8B8D1193AFD22E538CE0C9FB50FEE155D0F6176CA68E65DA684C5DCE2D1E0815",
                    2,
                ),
                block_proposer(
                    "8DE8B12952F7058D827BD04CDFF1C2175D87BBF89F28B52452A637BC979ADDC4",
                    2,
                ),
                block_proposer(
                    "8E11EB784883D3DC9D0D74A74633F067DC61C408DFDEE49B8F93BB161F2916C0",
                    2,
                ),
                block_proposer(
                    "91BBCE94C34EBDE0D099C0A2CB7635C0C31425EBABCEC644F4F1A0854BFA605D",
                    2,
                ),
                block_proposer(
                    "9712E85D660FA2F761F980EF5812C225F33F336F285728803DCD421937D3DF54",
                    2,
                ),
                block_proposer(
                    "9CB04F271BA050132C00CC5838FB69E77BC55B5689F9D2D850DC528935F8145C",
                    2,
                ),
                block_proposer(
                    "B3B5748571B60FE9AD112715D6A51725D6E5A52A9C3AF5FD36A1724CF50D862F",
                    2,
                ),
                block_proposer(
                    "BA8CE1DC72857B4168E33272571DF7FBAF84C316DFE48217ADDCF6595E254216",
                    2,
                ),
                block_proposer(
                    "D9B090CFC19CAF2E27D512E69C43812A274BDF29C081D0ADE4FD272AD56A5F89",
                    2,
                ),
            ],
        };

        let rewards = PlatformReward::epoch_proposer_rewards(152906, &epoch_info);

        let amount_of = |pro_tx_hash: &str| {
            rewards
                .iter()
                .find(|reward| reward.pro_tx_hash == pro_tx_hash)
                .unwrap()
                .amount
        };

        assert_eq!(rewards.len(), 21);
        assert_eq!(
            rewards.iter().map(|reward| reward.amount).sum::<i64>(),
            1899081757726
        );
        assert_eq!(
            amount_of("88251BD4B124EFEB87537DEABEEC54F6C8F575F4DF81F10CF5E8EEA073092B6F"),
            97388808088
        );
        assert_eq!(
            amount_of("6D1B185BA036EFCD44A77E05A9AAF69A0C4E40976AEC00B04773E52863320966"),
            48694404044
        );
        assert_eq!(
            amount_of("FF261D2C1C76907A2AD8AEB6C5611796F03B5CBD88AE92452A4727E13F4F4AC9"),
            97388808088 + 10
        );
        assert!(rewards
            .iter()
            .all(|reward| reward.block_height == 152906 && reward.epoch == 8628));
    }
}
