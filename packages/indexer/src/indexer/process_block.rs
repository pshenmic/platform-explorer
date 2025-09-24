use crate::indexer::Indexer;
use crate::processor::psql::ProcessorError;
use tokio::time::Interval;

impl Indexer {
    pub(crate) async fn process_block(
        &mut self,
        last_block_height: i32,
        current_block_height: i32,
        interval: &mut Interval,
    ) {
        if last_block_height > current_block_height {
            for block_height in current_block_height + 1..last_block_height + 1 {
                loop {
                    let result = self.index_block(block_height.clone()).await;

                    match result {
                        Ok(_) => {
                            break;
                        }
                        Err(err) => Indexer::process_error(err, block_height),
                    }

                    interval.tick().await;
                }
            }
        }
    }

    fn process_error(err: ProcessorError, block_height: i32) {
        match err {
            ProcessorError::DatabaseError => {
                println!(
                    "Database error occurred while indexing block height {} retrying ...",
                    block_height
                );
            }
            ProcessorError::UnexpectedError => {
                println!(
                    "Unexpected processor error happened at block height {}, retrying ...",
                    block_height
                );
            }
            // https://github.com/pshenmic/platform-explorer/issues/170
            ProcessorError::TenderdashTxResultNotExists => {
                println!("Block TX Count length and Block Results Tx Count length did not match for height {}, retrying...", block_height);
            }
        }
    }
}
