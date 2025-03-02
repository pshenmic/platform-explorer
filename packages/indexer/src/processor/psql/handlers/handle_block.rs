use base64::Engine;
use base64::engine::general_purpose;
use crate::entities::block::Block;
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};

impl PSQLProcessor {
  pub async fn handle_block(&self, block: Block, validators: Vec<Validator>) -> Result<(), ProcessorError> {
    let processed = self.dao.get_block_header_by_height(block.header.height.clone()).await?;

    match processed {
      None => {
        // TODO IMPLEMENT PSQL TRANSACTION
        let block_height = block.header.height.clone();

        if block.header.height == 1 {
          self.handle_init_chain().await;
        }

        for (_, validator) in validators.iter().enumerate() {
          self.handle_validator(validator.clone()).await?;
        }

        let block_hash = self.dao.create_block(block.header).await;

        if block.txs.len() as i32 == 0 {
          println!("No platform transactions at block height {}", block_height.clone());
        }

        println!("Processing block at height {}", block_height.clone());
        for (i, tx) in block.txs.iter().enumerate() {
          let bytes = general_purpose::STANDARD.decode(tx.data.clone()).unwrap();
          let st_result = self.decoder.decode(bytes).await;

          let state_transition = st_result.unwrap();

          self.handle_st(block_hash.clone(), i as u32, state_transition, tx.clone()).await;
        }

        Ok(())
      }
      Some(_) => {
        println!("Block at the height {} has been already processed", &block.header.height);
        Ok(())
      }
    }
  }
}