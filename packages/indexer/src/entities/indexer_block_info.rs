use dpp::platform_value::platform_value;
use dpp::prelude::BlockHeight;
use serde_json::Value;

pub struct IndexerBlockInfo {
    pub block_height: BlockHeight,
}

impl TryFrom<IndexerBlockInfo> for Value {
    type Error = serde_json::Error;
    fn try_from(info: IndexerBlockInfo) -> Result<Self, Self::Error> {
        serde_json::to_value(platform_value!({
            "blockHeight": info.block_height,
        }))
    }
}
