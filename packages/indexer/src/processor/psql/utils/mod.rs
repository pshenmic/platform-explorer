use crate::processor::psql::PSQLProcessor;
use dashcore_rpc::RpcApi;
use dpp::dashcore::{Block, BlockHash};

impl PSQLProcessor {
    pub fn get_l1_block_hash(&self, height: i32) -> BlockHash {
        self.dashcore_rpc.get_block_hash(height as u32).unwrap()
    }

    pub fn get_l1_block(&self, hash: &BlockHash) -> Option<Block> {
        match self.dashcore_rpc.get_block(hash) {
            Ok(block) => Some(block),
            Err(e) => {
                println!("Cannot get l1 block: {:?}", e);
                None
            }
        }
    }
}
