use crate::entities::shielded_transition::ShieldedTransition;
use crate::processor::psql::PSQLProcessor;
use deadpool_postgres::{PoolError, Transaction};

impl PSQLProcessor {
    pub async fn handle_shielded_transition(
        &self,
        transition: ShieldedTransition,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        self.dao
            .create_shielded_transition(transition, sql_transaction)
            .await?;

        Ok(())
    }
}
