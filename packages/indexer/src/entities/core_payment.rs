use dashcore_rpc::json::MasternodePayment;

#[derive(Clone, Debug, PartialEq)]
pub struct CorePayment {
    pub core_block_height: i32,
    pub pro_tx_hash: String,
    pub amount: i64,
}

// Every Core block also pays the Platform credit pool through an OP_RETURN output that
// Core lists among the masternode payees, it is not part of what the masternode receives
impl From<(u64, MasternodePayment)> for CorePayment {
    fn from((core_block_height, masternode): (u64, MasternodePayment)) -> Self {
        CorePayment {
            core_block_height: core_block_height as i32,
            pro_tx_hash: masternode.pro_tx_hash.to_string().to_uppercase(),
            amount: masternode
                .payees
                .iter()
                .filter(|payee| !payee.script.is_op_return())
                .map(|payee| payee.amount as i64)
                .sum(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dashcore_rpc::json::GetMasternodePaymentsResult;
    use serde_json::json;

    #[test]
    fn excludes_the_platform_credit_pool_output() {
        let block: GetMasternodePaymentsResult = serde_json::from_value(json!({
          "height": 1566100,
          "blockhash": "0000004a23fd0f44f4f9d315efa2500b825b08113530fb8e356eff55ccb2a6c3",
          "amount": 178585714,
          "masternodes": [
            {
              "proTxHash": "6d1b185ba036efcd44a77e05a9aaf69a0c4e40976aec00b04773e52863320966",
              "amount": 178585714,
              "payees": [
                { "address": "", "script": "6a", "amount": 66966830 },
                { "address": "yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A", "script": "76a914c69a0bda7daaae481be8def95e5f347a1d00a4b488ac", "amount": 111000000 },
                { "address": "yVXDAM73Tg6A44Bm3qduXsMCYxzuqBCT48", "script": "76a914aa0bda7daaae481be8def95e5f347a1d00a4b488ac", "amount": 618884 }
              ]
            }
          ]
        }))
        .unwrap();

        let masternode = block.masternodes[0].clone();

        assert_eq!(
            CorePayment::from((block.height, masternode)),
            CorePayment {
                core_block_height: 1566100,
                pro_tx_hash: String::from(
                    "6D1B185BA036EFCD44A77E05A9AAF69A0C4E40976AEC00B04773E52863320966"
                ),
                amount: 111618884,
            }
        );
    }
}
