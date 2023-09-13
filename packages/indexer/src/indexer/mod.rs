use std::any::Any;
use std::cell::Cell;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use dpp::state_transition::StateTransition;
use base64::{Engine as _, engine::{general_purpose}};
use futures::stream;
use tokio::{task, time};
use tokio::time::{Instant, Interval};
use crate::models::{PlatformExplorerSearchResponse, PlatformExplorerStatusResponse, TDBlock, TDBlockHeader};
use crate::processor::psql::PSQLProcessor;

pub struct Indexer {
    processor: PSQLProcessor,
    last_block_height: Cell<i32>,
}

impl Indexer {
    pub fn new() -> Indexer {
        let processor = PSQLProcessor::new();

        return Indexer { processor, last_block_height: Cell::new(2030) };
    }

    pub async fn start(&self) {
        println!("Indexer loop started");

        let mut interval = time::interval(Duration::from_millis(3000));

        loop {
            interval.tick().await;

            let current_block_height:i32 = self.last_block_height.get();
            let last_block_height:i32 = self.fetch_last_block().await;

            let diff = last_block_height.clone() - current_block_height.clone();

            if diff > 0 {
                for block_height in current_block_height..last_block_height+1 {
                    self.index_block(block_height).await;
                }
            }
        }
    }

    async fn index_block(&self, block_height: i32) {
        let url = format!("https://platform-explorer-api.rd.dash.org/search?query={}", &block_height);

        let resp = reqwest::get(url)
            .await
            .unwrap()
            .json::<PlatformExplorerSearchResponse>()
            .await
            .unwrap();

        let txs = resp.block.block.data.txs;
        let hash = resp.block.block_id.hash;

        let block = TDBlock{txs: txs.clone(), header: TDBlockHeader{hash: hash.clone(), block_height: block_height.clone(), tx_count: txs.len() as i32 }};

        self.processor.handle_block(block).await;

        self.last_block_height.set(block_height);
    }

    async fn fetch_last_block(&self) -> i32 {
        let resp = reqwest::get("https://platform-explorer-api.rd.dash.org/status")
            .await
            .unwrap()
            .json::<PlatformExplorerStatusResponse>()
            .await
            .unwrap();

        let blocks_count = resp.blocks_count.parse::<i32>().unwrap();

        return blocks_count;
    }
}

