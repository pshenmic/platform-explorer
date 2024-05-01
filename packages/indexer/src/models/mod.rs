use chrono::{DateTime, Utc};
use serde::{Deserialize};
use crate::entities::validator::Validator;

#[derive(Deserialize)]
pub struct TenderdashRPCStatusResponse {
    pub sync_info: TenderdashSyncInfo
}

#[derive(Deserialize)]
pub struct TenderdashRPCValidatorsResponse {
    pub block_height: i32,
    pub validators: Vec<TDValidator>
}

#[derive(Deserialize)]
pub struct TenderdashSyncInfo {
    pub latest_block_height: String
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
    pub block: String
}

#[derive(Deserialize)]
pub struct TDBlockHeader {
    pub height: String,
    pub version: TDBlockHeaderVersion ,
    pub chain_id: String,
    pub core_chain_locked_height: i32,
    #[serde(rename = "time")]
    #[serde(with = "from_iso8601")]
    pub timestamp: DateTime<Utc>,
    pub proposer_pro_tx_hash: String
}

#[derive(Deserialize)]
pub struct TDBlock {
    pub header: TDBlockHeader,
    pub data: TDBlockData,
}

#[derive(Deserialize)]
pub struct TenderdashRPCBlockResponse {
    pub block_id: TDBlockId,
    pub block: TDBlock,
}

mod from_iso8601 {
    use chrono::{Utc, DateTime};
    use serde::{self, Deserialize, Deserializer};

    pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
        where
            D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let parsed = DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&Utc);

        Ok(parsed)
    }
}

impl TryFrom<TenderdashRPCValidatorsResponse> for Vec<Validator> {
    type Error = ();

    fn try_from(resp: TenderdashRPCValidatorsResponse) -> Result<Self, Self::Error> {
        let validators: Vec<Validator> = resp.validators
            .iter()
            .map(|td_validator| { Validator { pro_tx_hash: td_validator.pro_tx_hash.clone() } })
            .collect();

        Ok(validators)
    }
}
