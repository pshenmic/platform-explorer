use deadpool_postgres::tokio_postgres::Row;
use serde::{Deserialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformExplorerStatusResponse {
    pub network: String,
    pub app_version: String,
    pub p2p_version: String,
    pub block_version: String,
    pub blocks_count: String,
    pub tenderdash_version: String,
}

#[derive(Debug, Deserialize)]
pub struct BlockId {
    pub hash: String,
}

#[derive(Debug, Deserialize)]
pub struct BlockData {
    pub txs: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct BlockHeader {
    pub height: String,
}

#[derive(Debug, Deserialize)]
pub struct Block {
    pub header: BlockHeader,
    pub data: BlockData,
}

#[derive(Debug, Deserialize)]
pub struct BlockWrapper {
    pub block_id: BlockId,
    pub block: Block,
}

#[derive(Debug, Deserialize)]
pub struct PlatformExplorerSearchResponse {
    pub block: BlockWrapper,
}

#[derive(Clone)]
pub struct TDBlockHeader {
    pub hash: String,
    pub block_height: i32,
    pub tx_count: i32,
}

pub struct TDBlock {
    pub header: TDBlockHeader,
    pub txs: Vec<String>,
}

pub struct PlatformStateTransition {

}
