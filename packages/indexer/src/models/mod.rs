use std::time::SystemTime;
use chrono::{DateTime, NaiveDate, NaiveDateTime, TimeZone, Utc};
use serde::{Deserialize};

#[derive(Deserialize)]
pub struct TenderdashRPCStatusResponse {
    pub sync_info: TenderdashSyncInfo
}

#[derive(Deserialize)]
pub struct TenderdashSyncInfo {
    pub latest_block_height: String
}

#[derive(Deserialize)]
pub struct TenderdashBlockResponse {
    pub block: BlockWrapper,
}

#[derive(Deserialize)]
pub struct BlockId {
    pub hash: String,
}

#[derive(Deserialize)]
pub struct BlockData {
    pub txs: Vec<String>,
}

#[derive(Deserialize)]
pub struct BlockHeaderVersion {
    pub block: String,
    pub app: String,
}

#[derive(Deserialize)]
pub struct BlockHeader {
    pub height: String,
    pub version: BlockHeaderVersion ,
    pub chain_id: String,
    pub core_chain_locked_height: String,
    pub timestamp: DateTime<Utc>
}

#[derive(Deserialize)]
pub struct Block {
    pub header: BlockHeader,
    pub data: BlockData,
}

#[derive(Deserialize)]
pub struct BlockWrapper {
    pub block_id: BlockId,
    pub block: Block,
}

#[derive(Clone)]
pub struct TDBlockHeader {
    pub hash: String,
    pub block_height: i32,
    pub tx_count: i32,
    pub timestamp: DateTime<Utc>
}

pub struct TDBlock {
    pub header: TDBlockHeader,
    pub txs: Vec<String>,
}

pub struct PlatformStateTransition {

}
