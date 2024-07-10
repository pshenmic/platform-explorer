use std::cell::Cell;
use std::env;
use std::time::Duration;
use tokio::{time};
use crate::entities::block::Block;
use crate::entities::block_header::BlockHeader;
use crate::processor::psql::{ProcessorError, PSQLProcessor};
use base64::{Engine as _, engine::{general_purpose}};
use crate::decoder::decoder::StateTransitionDecoder;
use crate::models::{TransactionResult, TransactionStatus};
use crate::utils::TenderdashRpcApi;

pub enum IndexerError {
    BackendUrlError,
    ProcessorError,
}

impl From<reqwest::Error> for IndexerError {
    fn from(value: reqwest::Error) -> Self {
        println!("{}", value);
        IndexerError::BackendUrlError
    }
}

impl From<ProcessorError> for IndexerError {
    fn from(_: ProcessorError) -> Self {
        IndexerError::ProcessorError
    }
}


pub struct Indexer {
    tenderdash_rpc: TenderdashRpcApi,
    processor: PSQLProcessor,
    decoder: StateTransitionDecoder,
    last_block_height: Cell<i32>,
    txs_to_skip: Vec<String>,
}

impl Indexer {
    pub fn new() -> Indexer {
        let processor = PSQLProcessor::new();
        let backend_url = env::var("BACKEND_URL").expect("You've not set the BACKEND_URL");
        let txs_to_skip = env::var("TXS_TO_SKIP").unwrap_or(String::from(""));
        let decoder = StateTransitionDecoder::new();

        return Indexer {
            tenderdash_rpc: TenderdashRpcApi::new(backend_url),
            processor,
            decoder,
            last_block_height: Cell::new(0),
            txs_to_skip: txs_to_skip.split(",")
                .map(|s| { String::from(s) }).collect::<Vec<String>>(),
        };
    }

    pub async fn start(&self) {
        println!("Indexer loop started");

        let mut interval = time::interval(Duration::from_millis(3000));

        loop {
            interval.tick().await;

            let status_result = self.fetch_last_block().await;

            let last_block_height = match status_result {
                Ok(last_block_height) => last_block_height,
                Err(err) => {
                    println!("{}", err);
                    continue;
                }
            };

            let current_block_height: i32 = self.last_block_height.get();

            if last_block_height > current_block_height {
                for block_height in current_block_height + 1..last_block_height + 1 {
                    loop {
                        let result = self.index_block(block_height.clone()).await;

                        match result {
                            Ok(_) => {
                                break;
                            }
                            Err(err) => {
                                match err {
                                    ProcessorError::DatabaseError => {
                                        println!("Database error occurred while indexing block height {} retrying ...", block_height);
                                    }
                                    ProcessorError::UnexpectedError => {
                                        println!("Unexpected processor error happened at block height {}, retrying ...", block_height);
                                    }
                                    // https://github.com/pshenmic/platform-explorer/issues/170
                                    ProcessorError::TenderdashTxResultNotExists => {
                                        println!("Block TX Count length and Block Results Tx Count length did not match for height {}, retrying...", block_height);
                                    }
                                }
                            }
                        }

                        interval.tick().await;
                    }
                }
            }
        }
    }
    async fn index_block(&self, block_height: i32) -> Result<(), ProcessorError> {
        let block = self.tenderdash_rpc.get_block_by_height(block_height.clone()).await?;
        let block_results_response = self.tenderdash_rpc.get_block_results_by_height(block_height.clone()).await?;
        let validators = self.tenderdash_rpc.get_validators_by_block_height(block_height.clone()).await?;

        let tx_results = block_results_response.txs_results.unwrap_or(vec![]);

        if block.block.data.txs.len() != tx_results.len() {
            return Err(ProcessorError::TenderdashTxResultNotExists);
        }

        let block_hash = block.block_id.hash;

        let transactions = block.block.data.txs.iter().enumerate().map(|(i, tx_string)| {
            let tx_result = tx_results.get(i)
                .expect(&format!("tx result at index {} should exist in block results of block with hash {}",
                                 i, &block_hash));

            return match tx_result.code {
                None => {
                    TransactionResult {
                        data: tx_string.clone(),
                        gas_used: tx_result.gas_used.clone(),
                        status: TransactionStatus::SUCCESS,
                        code: None,
                        error: None,
                    }
                }
                Some(_) => {
                    TransactionResult {
                        data: tx_string.clone(),
                        gas_used: tx_result.gas_used.clone(),
                        status: TransactionStatus::FAIL,
                        code: tx_result.code.clone(),
                        error: tx_result.info.clone(),
                    }
                }
            };
        }).collect::<Vec<TransactionResult>>();

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

        let block = Block {
            header: BlockHeader {
                hash: block_hash,
                height: block_height.clone(),
                tx_count: txs.len() as i32,
                timestamp,
                block_version,
                app_version,
                l1_locked_height: core_chain_locked_height,
                proposer_pro_tx_hash: block.block.header.proposer_pro_tx_hash,
            },
            txs,
        };

        self.processor.handle_block(block, validators).await?;

        self.last_block_height.set(block_height);

        Ok(())
    }

    async fn fetch_last_block(&self) -> Result<i32, reqwest::Error> {
        let resp = self.tenderdash_rpc.get_status().await?;

        let blocks_count = resp.sync_info.latest_block_height.parse::<i32>().unwrap();

        Ok(blocks_count)
    }
}