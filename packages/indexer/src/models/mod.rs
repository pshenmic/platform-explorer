use crate::entities::validator::Validator;
use chrono::{DateTime, Utc};
use dpp::platform_value::platform_value;
use serde::Deserialize;
use serde_json::{Error, Value};
use std::fmt::Display;

#[derive(Deserialize)]
pub struct TenderdashRPCStatusResponse {
    pub sync_info: TenderdashSyncInfo,
}

#[derive(Deserialize)]
pub struct TenderdashRPCValidatorsResponse {
    pub block_height: i32,
    pub validators: Vec<TDValidator>,
}

#[derive(Deserialize)]
pub struct TenderdashSyncInfo {
    pub latest_block_hash: String,
    pub latest_app_hash: String,
    pub latest_block_height: String,
    pub latest_block_time: String,
    pub earliest_block_hash: String,
    pub earliest_app_hash: String,
    pub earliest_block_height: String,
    pub earliest_block_time: String,
    pub max_peer_block_height: String,
    pub catching_up: bool,
    pub total_synced_time: String,
    pub remaining_time: String,
    pub total_snapshots: String,
    pub chunk_process_avg_time: String,
    pub snapshot_height: String,
    pub snapshot_chunks_count: String,
    pub backfilled_blocks: String,
    pub backfill_blocks_total: String,
}

#[derive(Deserialize)]
pub struct TDValidator {
    pub pro_tx_hash: String,
    pub voting_power: String,
}

#[derive(Deserialize)]
pub struct TDBlockId {
    pub hash: String,
}

#[derive(Deserialize)]
pub struct TDBlockData {
    pub txs: Vec<String>,
}

#[derive(Deserialize)]
pub struct TDBlockHeaderVersion {
    pub app: String,
    pub block: String,
}

#[derive(Deserialize)]
pub struct TDBlockHeader {
    pub version: TDBlockHeaderVersion,
    pub core_chain_locked_height: i32,
    #[serde(rename = "time")]
    #[serde(with = "from_iso8601")]
    pub timestamp: DateTime<Utc>,
    pub proposer_pro_tx_hash: String,
    pub app_hash: String,
}

#[derive(Deserialize)]
pub struct TDBlock {
    pub header: TDBlockHeader,
    pub data: TDBlockData,
}

#[derive(Deserialize)]
pub struct TDTxResult {
    pub code: Option<u32>,
    pub info: Option<String>,
    pub gas_used: u64,
}

#[derive(Deserialize)]
pub struct TenderdashRPCBlockResponse {
    pub block_id: TDBlockId,
    pub block: TDBlock,
}
#[derive(Deserialize)]
pub struct TenderdashRPCBlockResultsResponse {
    pub txs_results: Option<Vec<TDTxResult>>,
}

#[derive(Clone, Debug)]
pub enum TransactionStatus {
    FAIL,
    SUCCESS,
}

impl Display for TransactionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Clone)]
pub struct TransactionResult {
    pub data: String,
    pub gas_used: u64,
    pub status: TransactionStatus,
    pub error: Option<String>,
}

impl TryFrom<TransactionResult> for Value {
    type Error = Error;

    fn try_from(tx_result: TransactionResult) -> Result<Self, Self::Error> {
        serde_json::to_value(platform_value!({
            "data": tx_result.data,
            "gas_used": tx_result.gas_used,
            "status": tx_result.status.to_string(),
            "error": tx_result.error
        }))
    }
}

mod from_iso8601 {
    use chrono::{DateTime, Utc};
    use serde::{self, Deserialize, Deserializer};

    pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let parsed = DateTime::parse_from_rfc3339(&s)
            .unwrap()
            .with_timezone(&Utc);

        Ok(parsed)
    }
}

impl TryFrom<TenderdashRPCValidatorsResponse> for Vec<Validator> {
    type Error = ();

    fn try_from(resp: TenderdashRPCValidatorsResponse) -> Result<Self, Self::Error> {
        let validators: Vec<Validator> = resp
            .validators
            .iter()
            .map(|td_validator| Validator {
                pro_tx_hash: td_validator.pro_tx_hash.clone(),
                id: None,
            })
            .collect();

        Ok(validators)
    }
}
