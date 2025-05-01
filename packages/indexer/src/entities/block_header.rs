use std::time::SystemTime;
use chrono::{DateTime, Utc};
use tokio_postgres::Row;

#[derive(Clone)]
pub struct BlockHeader {
    pub hash: String,
    pub height: i32,
    pub timestamp: DateTime<Utc>,
    pub block_version: i32,
    pub app_version: i32,
    pub l1_locked_height: i32,
    pub app_hash: String,
    pub proposer_pro_tx_hash: String,
    pub l2_reward: Option<i64>,
}

impl From<Row> for BlockHeader {
    fn from(row: Row) -> Self {
        let hash: String = row.get(0);
        let height: i32 = row.get(1);
        let timestamp:SystemTime = row.get(2);
        let block_version: i32 = row.get(3);
        let app_version: i32 = row.get(4);
        let l1_locked_height: i32 = row.get(5);
        let proposer_pro_tx_hash: String = row.get(6);
        let app_hash: String = row.get(7);
        let l2_reward: Option<i64> = row.get(8);

        return BlockHeader { hash, height , timestamp: timestamp.into(), block_version, app_version, l1_locked_height, proposer_pro_tx_hash, app_hash, l2_reward };
    }
}

