use std::cell::Cell;
use std::env;
use std::time::Duration;
use tokio::{time};
use crate::entities::block::Block;
use crate::entities::block_header::BlockHeader;
use crate::processor::psql::{ProcessorError, PSQLProcessor};
use base64::{Engine as _, engine::{general_purpose}};
use dashcore_rpc::{Auth, Client};
use crate::decoder::decoder::StateTransitionDecoder;
use crate::models::{TransactionResult, TransactionStatus};
use crate::utils::TenderdashRpcApi;

pub mod process_block;
pub mod start;
pub mod index_block;

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
    decoder: StateTransitionDecoder,
    last_block_height: Cell<i32>,
    txs_to_skip: Vec<String>,
}

impl Indexer {
    pub fn new() -> Indexer {
        let core_rpc_host: String = env::var("CORE_RPC_HOST").expect("You've not set the CORE_RPC_HOST").parse().expect("Failed to parse CORE_RPC_HOST env");
        let core_rpc_port: String = env::var("CORE_RPC_PORT").expect("You've not set the CORE_RPC_PORT").parse().expect("Failed to parse CORE_RPC_PORT env");
        let core_rpc_user: String = env::var("CORE_RPC_USER").expect("You've not set the CORE_RPC_USER").parse().expect("Failed to parse CORE_RPC_USER env");
        let core_rpc_password: String = env::var("CORE_RPC_PASSWORD").expect("You've not set the CORE_RPC_PASSWORD").parse().expect("Failed to parse CORE_RPC_PASSWORD env");

        let dashcore_rpc = Client::new(&format!("{}:{}", core_rpc_host, &core_rpc_port),
                                       Auth::UserPass(core_rpc_user, core_rpc_password)).unwrap();


        let processor = PSQLProcessor::new(dashcore_rpc);
        let tenderdash_url = env::var("TENDERDASH_URL").expect("You've not set the TENDERDASH_URL");
        let txs_to_skip = env::var("TXS_TO_SKIP").unwrap_or(String::from(""));
        let decoder = StateTransitionDecoder::new();

        Indexer {
            tenderdash_rpc: TenderdashRpcApi::new(tenderdash_url),
            processor,
            decoder,
            last_block_height: Cell::new(0),
            txs_to_skip: txs_to_skip.split(",")
                .map(|s| { String::from(s) }).collect::<Vec<String>>(),
        }
    }
}

