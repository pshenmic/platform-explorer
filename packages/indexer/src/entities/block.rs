use crate::entities::block_header::BlockHeader;
use crate::models::TransactionResult;
use dpp::platform_value::platform_value;
use serde_json::{Error, Value};

pub struct Block {
    pub header: BlockHeader,
    pub txs: Vec<TransactionResult>,
}
