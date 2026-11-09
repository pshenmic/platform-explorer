use crate::entities::core_payment::CorePayment;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};

impl PostgresDAO {
    pub async fn create_core_payment(
        &self,
        core_payment: CorePayment,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO core_payments(core_block_height, pro_tx_hash, amount) \
        VALUES ($1, $2, $3);",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &core_payment.core_block_height,
                    &core_payment.pro_tx_hash,
                    &core_payment.amount,
                ],
            )
            .await
            .unwrap();

        Ok(())
    }
}
