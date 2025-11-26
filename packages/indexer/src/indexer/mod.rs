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
        let txs_to_skip_str = env::var("TXS_TO_SKIP").unwrap_or(String::from(""));

        let mut txs_to_skip = txs_to_skip_str
            .split(",")
            .map(|s| String::from(s).to_lowercase())
            .collect::<Vec<String>>();

        // skip non unique txs
        // https://github.com/dashpay/platform/issues/2867
        txs_to_skip.push("f72dd58af03236502b13cefa918bc13089a689b4cd06dbd44bbe277d1a77e0ab:cf285c01204a6811a06b4b60f599870fffd77f2ceafd771c2608ed56a4454ca0".to_string());
        txs_to_skip.push("f72dd58af03236502b13cefa918bc13089a689b4cd06dbd44bbe277d1a77e0ab:9be24f6636e70d288c82a37c6b6ff9622e8f3f7c2b6dccb44d005305febeadad".to_string());

        let start_height = processor.get_latest_block_height().await;

        Indexer {
            tenderdash_rpc: TenderdashRpcApi::new(tenderdash_url),
            processor,
            last_block_height: Cell::new(start_height),
            txs_to_skip,
        }
    }
}
