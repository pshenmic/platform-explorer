use crate::processor::psql::PostgresDAO;
use deadpool_postgres::Transaction;

impl PostgresDAO {
    pub async fn create_state_transition_duplicate(
        &self,
        hash: String,
        block_hash: String,
        sql_transaction: &Transaction<'_>,
    ) {
        let query =
            "INSERT INTO state_transition_duplicates(hash, block_hash) VALUES ($1, $2);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(&stmt, &[&hash, &block_hash])
            .await
            .unwrap();
    }
}