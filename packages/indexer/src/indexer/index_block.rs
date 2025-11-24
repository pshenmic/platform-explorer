use crate::entities::block::Block;
use crate::entities::block_header::BlockHeader;
use crate::indexer::Indexer;
use crate::models::{TransactionResult, TransactionStatus};
use crate::processor::psql::ProcessorError;
use base64::engine::general_purpose;
use base64::Engine;

impl Indexer {
    pub(crate) async fn index_block(&mut self, block_height: i32) -> Result<(), ProcessorError> {
        let block = self
            .tenderdash_rpc
            .get_block_by_height(block_height.clone())
            .await?;
        let block_results_response = self
            .tenderdash_rpc
            .get_block_results_by_height(block_height.clone())
            .await?;
        let validators = self
            .tenderdash_rpc
            .get_validators_by_block_height(block_height.clone())
            .await?;

        let tx_results = block_results_response.txs_results.unwrap_or(vec![]);

        if block.block.data.txs.len() != tx_results.len() {
            return Err(ProcessorError::TenderdashTxResultNotExists);
        }

        let block_hash = block.block_id.hash;

        let transactions = block
            .block
            .data
            .txs
            .iter()
            .enumerate()
            .map(|(i, tx_string)| {
                let tx_result = tx_results.get(i).expect(&format!(
                    "tx result at index {} should exist in block results of block with hash {}",
                    i, &block_hash
                ));

                return match tx_result.code {
                    None => TransactionResult {
                        data: tx_string.clone(),
                        gas_used: tx_result.gas_used.clone(),
                        status: TransactionStatus::SUCCESS,
                        error: None,
                    },
                    Some(_) => TransactionResult {
                        data: tx_string.clone(),
                        gas_used: tx_result.gas_used.clone(),
                        status: TransactionStatus::FAIL,
                        error: tx_result.info.clone(),
                    },
                };
            })
            .collect::<Vec<TransactionResult>>();

        let txs = transactions.into_iter().filter(|tx| {
            let bytes = general_purpose::STANDARD.decode(tx.data.clone()).unwrap();
            let tx_hash = sha256::digest(bytes.clone()).to_uppercase();

            let skip = self.txs_to_skip.contains(&format!("{}:{}", &block_hash, &tx_hash));

            if skip {
                println!("Transaction {} from block with hash {} is skipped because it's marked that in TXS_TO_SKIP environment", &tx_hash, &block_hash);
            }

            return !skip;
        }).collect::<Vec<TransactionResult>>();

        let timestamp = block.block.header.timestamp;
        let block_version = block.block.header.version.block.parse::<i32>()?;
        let app_version = block.block.header.version.app.parse::<i32>()?;
        let core_chain_locked_height = block.block.header.core_chain_locked_height;
        let app_hash = block.block.header.app_hash;

        let block = Block {
            header: BlockHeader {
                hash: block_hash,
                height: block_height.clone(),
                timestamp,
                block_version,
                app_version,
                l1_locked_height: core_chain_locked_height,
                app_hash,
                proposer_pro_tx_hash: block.block.header.proposer_pro_tx_hash,
            },
            txs,
        };

        self.processor.handle_block(block, validators).await?;

        self.last_block_height.set(block_height);

        Ok(())
    }
}
