use std::cell::Cell;
use std::env;
use std::time::Duration;
use tokio::{time};
use crate::entities::block::Block;
use crate::entities::block_header::BlockHeader;
use crate::models::{BlockWrapper, TenderdashRPCStatusResponse};
use crate::processor::psql::{ProcessorError, PSQLProcessor};
use base64::{Engine as _, engine::{general_purpose}};

pub enum IndexerError {
    BackendUrlError,
    ProcessorError
}

impl From<reqwest::Error> for IndexerError {
    fn from(value: reqwest::Error) -> Self {
        println!("{}", value);
        IndexerError::BackendUrlError
    }
}
impl From<ProcessorError> for IndexerError {
    fn from(value: ProcessorError) -> Self {
        IndexerError::ProcessorError
    }
}


pub struct Indexer {
    processor: PSQLProcessor,
    last_block_height: Cell<i32>,
    backend_url: String,
    txs_to_skip: Vec<String>
}

impl Indexer {
    pub fn new() -> Indexer {
        let processor = PSQLProcessor::new();
        let backend_url = env::var("BACKEND_URL").expect("You've not set the BACKEND_URL");
        let txs_to_skip = env::var("TXS_TO_SKIP").unwrap_or(String::from(""));

        return Indexer {
            processor,
            last_block_height: Cell::new(1),
            backend_url,
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
                    continue
                }
            };

            let current_block_height:i32 = self.last_block_height.get();

            let diff = last_block_height.clone() - current_block_height.clone();

            if diff > 0 {
                for block_height in current_block_height..last_block_height+1 {
                    loop {
                        let result = self.index_block(block_height.clone()).await;

                        match result {
                            Ok(_) => {
                                break;
                            }
                            Err(err) => {
                                match err {
                                    ProcessorError::DatabaseError => {
                                        println!("Database error occurred while indexing block height {}", block_height);
                                    }
                                    ProcessorError::UnexpectedError => {
                                        println!("Unexpected processor error happened at block height {}", block_height);
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

    async fn index_block(&self, block_height: i32) -> Result<(), ProcessorError>{
        let url = format!("{}/block?height={}", &self.backend_url, &block_height);

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(3))
            .build()?;

        let res = client
            .get(url)
            .send()
            .await?;

        let resp = res
            .json::<BlockWrapper>()
            .await?;

        let block_hash = resp.block_id.hash;
        let txs = resp.block.data.txs.iter().filter(|base64_str| {
            let bytes = general_purpose::STANDARD.decode(base64_str).unwrap();
            let tx_hash = sha256::digest(bytes.clone()).to_uppercase();

            let skip = self.txs_to_skip.contains(&format!("{}:{}", &block_hash, &tx_hash));

            if skip {
                println!("Transaction {} from block with hash {} is skipped because it's marked that in TXS_TO_SKIP environment", &tx_hash, &block_hash);
            }

            return !skip
        }).cloned().collect::<Vec<String>>();
        let timestamp = resp.block.header.timestamp;
        let block_version = resp.block.header.version.block.parse::<i32>()?;
        let app_version = resp.block.header.version.app.parse::<i32>()?;
        let core_chain_locked_height = resp.block.header.core_chain_locked_height;

        let block = Block {
            header: BlockHeader {
                hash: block_hash,
                height: block_height.clone(),
                tx_count: txs.len() as i32,
                timestamp,
                block_version,
                app_version,
                l1_locked_height: core_chain_locked_height,
            },
            txs
        };

        self.processor.handle_block(block).await?;

        self.last_block_height.set(block_height);

        Ok(())
    }

    async fn fetch_last_block(&self) -> Result<i32, reqwest::Error> {
        let url = format!("{}/status", &self.backend_url);

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(15))
            .build()?;

        let res = client
            .get(url)
            .send()
            .await?;

        let resp = res
            .json::<TenderdashRPCStatusResponse>()
            .await?;

        let blocks_count = resp.sync_info.latest_block_height.parse::<i32>().unwrap();

        Ok(blocks_count)
    }
}

