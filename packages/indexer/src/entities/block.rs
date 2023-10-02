use chrono::NaiveDateTime;
use crate::entities::block_header::BlockHeader;

pub struct Block {
    pub header: BlockHeader,
    pub txs: Vec<String>,
}
