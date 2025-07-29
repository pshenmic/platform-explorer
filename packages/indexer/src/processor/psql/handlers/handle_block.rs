use crate::entities::block::Block;
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use base64::engine::general_purpose;
use base64::Engine;
use deadpool_postgres::GenericClient;

impl PSQLProcessor {
    pub async fn handle_block(
        &self,
        block: Block,
        validators: Vec<Validator>,
    ) -> Result<(), ProcessorError> {
        let processed = self
            .dao
            .get_block_header_by_height(block.header.height.clone())
            .await?;

        match processed {
            None => {
                let block_height = block.header.height.clone();

                let mut client = self.dao.connection_pool.get().await.unwrap();
                let sql_transaction = client.transaction().await.unwrap();

                if block.header.height == 1 {
                    let mut init_client = self.dao.connection_pool.get().await.unwrap();

                    let init_sql_transaction = init_client.transaction().await.unwrap();

                    self.handle_init_chain(&init_sql_transaction).await;

                    init_sql_transaction
                        .commit()
                        .await
                        .expect("Cannot create initial data");
                }

                for (_, validator) in validators.iter().enumerate() {
                    self.handle_validator(validator.clone(), &sql_transaction)
                        .await?;
                }

                let block_hash = self
                    .dao
                    .create_block(block.header.clone(), &sql_transaction)
                    .await;

                if block.txs.len() as i32 == 0 {
                    println!(
                        "No platform transactions at block height {}",
                        block_height.clone()
                    );
                }

                println!("Processing block at height {}", block_height.clone());
                for (i, tx) in block.txs.iter().enumerate() {
                    let bytes = general_purpose::STANDARD.decode(tx.data.clone()).unwrap();
                    let st_result = self.decoder.decode(bytes).await;

                    let state_transition = st_result.unwrap();

                    self.handle_st(
                        block_hash.clone(),
                        block.header.height,
                        i as u32,
                        state_transition,
                        tx.clone(),
                        &sql_transaction,
                    )
                    .await;
                }

                sql_transaction
                    .commit()
                    .await
                    .expect("SQL Transaction Error");

                Ok(())
            }
            Some(_) => {
                println!(
                    "Block at the height {} has been already processed",
                    &block.header.height
                );
                Ok(())
            }
        }
    }
}
