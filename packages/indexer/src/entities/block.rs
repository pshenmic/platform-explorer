use crate::entities::block_header::BlockHeader;
use crate::models::TransactionResult;
use dpp::platform_value::platform_value;
use serde_json::{Error, Value};

pub struct Block {
    pub header: BlockHeader,
    pub txs: Vec<TransactionResult>,
}

impl TryFrom<Block> for Value {
    type Error = Error;

    fn try_from(block: Block) -> Result<Self, Self::Error> {
        let txs_value: Value = serde_json::Value::Array(
            block
                .txs
                .iter()
                .map(|tx| Value::try_from(tx.clone()))
                .collect::<Result<Vec<Value>, Error>>()?,
        );
        let header_value = Value::try_from(block.header)?;

        serde_json::to_value(platform_value!({
            "header": header_value,
            "txs": txs_value,
        }))
    }
}
