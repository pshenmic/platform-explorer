use std::time::SystemTime;
use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Deserializer, Serialize};
use time::serde::iso8601;

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

#[derive(Deserialize, Serialize)]
pub struct BlockHeaderVersion {
    pub app: String,
    pub block: String
}

#[derive(Deserialize, Serialize)]
pub struct BlockHeader {
    pub height: String,
    pub version: BlockHeaderVersion ,
    pub chain_id: String,
    pub core_chain_locked_height: i32,
    #[serde(rename = "time")]
    #[serde(with = "my_date_format")]
    pub timestamp: NaiveDateTime
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
    pub timestamp: NaiveDateTime,
    pub block_version: i32,
    pub app_version: i32,
    pub l1_locked_height: i32,
    pub chain: String,
}

pub struct TDBlock {
    pub header: TDBlockHeader,
    pub txs: Vec<String>,
}

pub struct PlatformStateTransition {

}


mod my_date_format {
    use chrono::{Utc, TimeZone, ParseResult, NaiveDateTime, DateTime};
    use serde::{self, Deserialize, Serializer, Deserializer};

    const FORMAT: &'static str = "%Y-%m-%dT%H:%M:%SZ";

    pub fn serialize<S>(date: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
    {
        let s = format!("{}", date.format(FORMAT));
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<NaiveDateTime, D::Error>
        where
            D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let parsed = DateTime::parse_from_rfc3339(&s).naive_utc();

        Ok(parsed)
    }
}
