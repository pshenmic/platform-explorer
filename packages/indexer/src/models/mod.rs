use chrono::{DateTime, Utc};
use dpp::state_transition::documents_batch_transition::{DocumentCreateTransition, DocumentDeleteTransition, DocumentReplaceTransition};
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
    pub timestamp: DateTime<Utc>
}

#[derive(Deserialize)]
pub struct TDBlock {
    pub header: TDBlockHeader,
    pub data: TDBlockData,
}

#[derive(Deserialize)]
pub struct BlockWrapper {
    pub block_id: TDBlockId,
    pub block: TDBlock,
}

enum DocumentTransition {
    Create(DocumentCreateTransition),
    Replace(DocumentReplaceTransition),
    Delete(DocumentDeleteTransition),
}

mod from_iso8601 {
    use chrono::{Utc, DateTime};
    use serde::{self, Deserialize, Serializer, Deserializer};

    const FORMAT: &'static str = "%Y-%m-%dT%H:%M:%SZ";

    pub fn serialize<S>(date: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
    {
        let s = format!("{}", date.format(FORMAT));
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
        where
            D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let parsed = DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&Utc);

        Ok(parsed)
    }
}
