use crate::entities::block_header::BlockHeader;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use std::time::SystemTime;
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn create_block(
        &self,
        block_header: BlockHeader,
        sql_transaction: &Transaction<'_>,
    ) -> String {
        let validator = self
            .get_validator_by_pro_tx_hash(
                block_header.proposer_pro_tx_hash.clone(),
                sql_transaction,
            )
            .await
            .expect(&format!(
                "Cannot find validator {}",
                block_header.proposer_pro_tx_hash
            ))
            .unwrap();

        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO blocks(hash, height, \
        timestamp, block_version, app_version, l1_locked_height, validator, validator_id, app_hash) \
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING hash;",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &block_header.hash,
                    &block_header.height,
                    &SystemTime::from(block_header.timestamp),
                    &block_header.block_version,
                    &block_header.app_version,
                    &block_header.l1_locked_height,
                    &block_header.proposer_pro_tx_hash,
                    &validator.id,
                    &block_header.app_hash,
                ],
            )
            .await
            .unwrap();

        let block_hash: String = block_header.hash;

        block_hash
    }

    pub async fn get_block_header_by_height(
        &self,
        block_height: i32,
    ) -> Result<Option<BlockHeader>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT hash,height,timestamp,\
        block_version,app_version,l1_locked_height,validator,app_hash FROM blocks where height = $1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[&block_height]).await.unwrap();

        let blocks: Vec<BlockHeader> = rows
            .into_iter()
            .map(|row| row.into())
            .collect::<Vec<BlockHeader>>();

        let block = blocks.first();

        Ok(block.cloned())
    }

    pub async fn get_latest_block_height(&self) -> Result<i32, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client
            .prepare_cached("SELECT height FROM blocks order by height desc limit 1")
            .await
            .unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[]).await.unwrap();

        let height = rows.first();

        match height {
            Some(row) => Ok(row.get(0)),
            None => Ok(0),
        }
    }
}
