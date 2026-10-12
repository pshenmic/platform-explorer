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
