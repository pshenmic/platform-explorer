use crate::processor::psql::{PSQLProcessor, ProcessorError};
use crate::utils::TenderdashRpcApi;
use dashcore_rpc::{Auth, Client};
use std::cell::Cell;
use std::env;

pub mod index_block;
pub mod process_block;
pub mod start;

pub enum IndexerError {
    TenderdashRPCError,
    ProcessorError,
}

impl From<reqwest::Error> for IndexerError {
    fn from(value: reqwest::Error) -> Self {
        println!("{}", value);
        IndexerError::TenderdashRPCError
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
    last_block_height: Cell<i32>,
    txs_to_skip: Vec<String>,
}

impl Indexer {
    pub async fn new() -> Indexer {
        let core_rpc_host: String = env::var("CORE_RPC_HOST")
            .expect("You've not set the CORE_RPC_HOST")
            .parse()
            .expect("Failed to parse CORE_RPC_HOST env");
        let core_rpc_port: String = env::var("CORE_RPC_PORT")
            .expect("You've not set the CORE_RPC_PORT")
            .parse()
            .expect("Failed to parse CORE_RPC_PORT env");
        let core_rpc_user: String = env::var("CORE_RPC_USER")
            .expect("You've not set the CORE_RPC_USER")
            .parse()
            .expect("Failed to parse CORE_RPC_USER env");
        let core_rpc_password: String = env::var("CORE_RPC_PASSWORD")
            .expect("You've not set the CORE_RPC_PASSWORD")
            .parse()
            .expect("Failed to parse CORE_RPC_PASSWORD env");

        let dashcore_rpc = Client::new(
            &format!("{}:{}", core_rpc_host, &core_rpc_port),
            Auth::UserPass(core_rpc_user, core_rpc_password),
        )
        .unwrap();

        let processor = PSQLProcessor::new(dashcore_rpc);
        let tenderdash_url = env::var("TENDERDASH_URL").expect("You've not set the TENDERDASH_URL");
        let txs_to_skip = env::var("TXS_TO_SKIP").unwrap_or(String::from(""));

        let start_height = processor.get_latest_block_height().await;

        Indexer {
            tenderdash_rpc: TenderdashRpcApi::new(tenderdash_url),
            processor,
            last_block_height: Cell::new(start_height),
            txs_to_skip: txs_to_skip
                .split(",")
                .map(|s| String::from(s))
                .collect::<Vec<String>>(),
        }
    }
}
