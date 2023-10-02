use chrono::{DateTime, NaiveDateTime, Utc};

#[derive(Clone)]
pub struct BlockHeader {
    pub hash: String,
    pub block_height: i32,
    pub tx_count: i32,
    pub timestamp: DateTime<Utc>,
    pub block_version: i32,
    pub app_version: i32,
    pub l1_locked_height: i32,
    pub chain: String,
}
