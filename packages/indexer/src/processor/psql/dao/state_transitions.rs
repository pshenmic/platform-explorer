use crate::enums::batch_type::BatchType;
use crate::models::TransactionStatus;
use crate::processor::psql::PostgresDAO;
use base64::engine::general_purpose;
use base64::Engine;
use deadpool_postgres::{PoolError, Transaction};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use sha256::digest;

impl PostgresDAO {
    pub async fn create_state_transition(
        &self,
        block_hash: String,
        block_height: i32,
        owner: Identifier,
        st_type: u32,
        index: u32,
        bytes: Vec<u8>,
        gas_used: u64,
        status: TransactionStatus,
        error: Option<String>,
        batch_type: Option<BatchType>,
        sql_transaction: &Transaction<'_>,
    ) {
        let data = general_purpose::STANDARD.encode(&bytes);
        let hash = digest(bytes.clone()).to_lowercase();
        let st_type = st_type as i32;
        let index_i32 = index as i32;

        let batch_type_i32 = batch_type.map(|t| t as i32);

        let status_str = match status {
            TransactionStatus::FAIL => "FAIL",
            TransactionStatus::SUCCESS => "SUCCESS",
        };

        let query = "INSERT INTO state_transitions(hash, owner, data, type, \
        index, block_hash, block_height, gas_used, status, error, batch_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &hash,
                    &owner.to_string(Base58),
                    &data,
                    &st_type,
                    &index_i32,
                    &block_hash.to_lowercase(),
                    &block_height,
                    &(gas_used as i64),
                    &status_str,
                    &error,
                    &batch_type_i32,
                ],
            )
            .await
            .unwrap();

        println!(
            "Created ST with hash {} from block with hash {}, owner = {}",
            &hash,
            &block_hash,
            &owner.to_string(Base58)
        );
    }

    pub async fn get_owner_by_state_transition_hash(
        &self,
        hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<String>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "SELECT owner FROM state_transitions \
        where hash = $1 LIMIT 1;",
            )
            .await
            .unwrap();

        let row = sql_transaction
            .query_one(&stmt, &[&hash.to_lowercase()])
            .await
            .unwrap();

        let owner: Option<String> = row.get(0);

        Ok(owner)
    }

    pub async fn get_state_transition_id(
        &self,
        hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<i32, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "SELECT id FROM state_transitions \
        where hash = $1 LIMIT 1;",
            )
            .await
            .unwrap();

        let row = sql_transaction
            .query_one(&stmt, &[&hash.to_lowercase()])
            .await
            .unwrap();

        let id: i32 = row.get(0);

        Ok(id)
    }
}
