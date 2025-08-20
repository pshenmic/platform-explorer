use crate::entities::validator::Validator;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn get_validator_by_pro_tx_hash(
        &self,
        pro_tx_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<Validator>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "SELECT pro_tx_hash, id \
        FROM validators where pro_tx_hash = $1 LIMIT 1;",
            )
            .await
            .unwrap();

        let rows: Vec<Row> = sql_transaction.query(&stmt, &[&pro_tx_hash]).await.unwrap();

        let validators: Vec<Validator> = rows
            .into_iter()
            .map(|row| row.into())
            .collect::<Vec<Validator>>();

        Ok(validators.first().cloned())
    }

    pub async fn create_validator(
        &self,
        validator: Validator,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO validators(pro_tx_hash) \
        VALUES ($1);",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(&stmt, &[&validator.pro_tx_hash])
            .await
            .unwrap();

        println!(
            "Created Validator with proTxHash {}",
            &validator.pro_tx_hash
        );

        Ok(())
    }
}
