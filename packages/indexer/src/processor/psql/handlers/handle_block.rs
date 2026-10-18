use crate::entities::block::Block;
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use base64::engine::general_purpose;
use base64::Engine;
use std::collections::HashMap;
use deadpool_postgres::GenericClient;

impl PSQLProcessor {
    pub async fn handle_block(
        &self,
        block: Block,
        validators: Vec<Validator>,
    ) -> Result<(), ProcessorError> {
        let last_block_header = self.last_block_header.borrow().clone();

        // the block next to the one this indexer has committed cannot be processed yet
        let processed = match &last_block_header {
            Some(last_block_header) if last_block_header.height == block.header.height - 1 => None,
            _ => {
                self.dao
                    .get_block_header_by_height(block.header.height.clone())
                    .await?
            }
        };

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

                // the validator set only changes on quorum rotation, so mostly all of them are known
                let new_validators = validators
                    .iter()
                    .filter(|validator| {
                        !self
                            .known_validators
                            .borrow()
                            .contains_key(&validator.pro_tx_hash)
                    })
                    .cloned()
                    .collect::<Vec<Validator>>();

                let mut new_validator_ids: HashMap<String, i32> = HashMap::new();

                for validator in new_validators.iter() {
                    let id = self
                        .handle_validator(validator.clone(), &sql_transaction)
                        .await?;

                    new_validator_ids.insert(validator.pro_tx_hash.clone(), id);
                }

                let proposer_pro_tx_hash = &block.header.proposer_pro_tx_hash;

                let known_proposer_id = self
                    .known_validators
                    .borrow()
                    .get(proposer_pro_tx_hash)
                    .or(new_validator_ids.get(proposer_pro_tx_hash))
                    .cloned();

                let proposer_id = match known_proposer_id {
                    Some(id) => id,
                    None => self
                        .dao
                        .get_validator_by_pro_tx_hash(
                            proposer_pro_tx_hash.clone(),
                            &sql_transaction,
                        )
                        .await?
                        .and_then(|validator| validator.id)
                        .expect(&format!("Cannot find validator {}", proposer_pro_tx_hash)),
                };

                let previous_block_header = match (block.header.height, last_block_header) {
                    (1, _) => None,
                    (height, Some(last_block_header)) if last_block_header.height == height - 1 => {
                        Some(last_block_header)
                    }
                    (height, _) => Some(
                        self.dao
                            .get_block_header_by_height(height - 1)
                            .await?
                            .expect("Previous block must be indexed"),
                    ),
                };

                let block_hash = self
                    .dao
                    .create_block(block.header.clone(), proposer_id, &sql_transaction)
                    .await;

                self.handle_core_payments(
                    &block.header,
                    previous_block_header.as_ref(),
                    &sql_transaction,
                )
                .await?;

                self.handle_platform_rewards(
                    &block.header,
                    previous_block_header.as_ref(),
                    &sql_transaction,
                )
                .await?;

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

                // only committed state is cached, a failed block is retried from scratch
                self.known_validators
                    .borrow_mut()
                    .extend(new_validator_ids);
                self.last_block_header.replace(Some(block.header.clone()));

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
