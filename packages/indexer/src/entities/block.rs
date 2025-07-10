use crate::entities::block_header::BlockHeader;
use crate::models::TransactionResult;

pub struct Block {
    pub header: BlockHeader,
    pub txs: Vec<TransactionResult>,
}
