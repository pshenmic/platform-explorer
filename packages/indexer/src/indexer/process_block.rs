use crate::entities::block::Block;
use crate::entities::validator::Validator;
use crate::indexer::Indexer;
use crate::processor::psql::ProcessorError;
use tokio::time::Interval;

impl Indexer {
    pub(crate) async fn process_block(
        &self,
        last_block_height: i32,
        current_block_height: i32,
        interval: &mut Interval,
    ) {
        if last_block_height > current_block_height {
            let mut next_block: Option<(Block, Vec<Validator>)> = None;

            for block_height in current_block_height + 1..last_block_height + 1 {
                loop {
                    // a block that failed to be indexed leaves the following one fetched
                    let fetched = match next_block.take() {
                        Some((block, validators)) if block.header.height == block_height => {
                            Ok((block, validators))
                        }
                        _ => self.fetch_block(block_height).await,
                    };

                    // the next block is fetched from Tenderdash while this one is written
                    let result = match fetched {
                        Ok((block, validators)) if block_height < last_block_height => {
                            let (result, next) = tokio::join!(
                                self.index_block(block, validators),
                                self.fetch_block(block_height + 1)
                            );

                            next_block = next.ok();

                            result
                        }
                        Ok((block, validators)) => self.index_block(block, validators).await,
                        Err(err) => Err(err),
                    };

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
