use crate::entities::shielded_transition::ShieldedTransition;
use crate::processor::psql::dao::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};

impl PostgresDAO {
    pub async fn create_shielded_transition(
        &self,
        transition: ShieldedTransition,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let transition_id = self
            .get_state_transition_id(transition.transition_hash, sql_transaction)
            .await?;
        let transition_type = transition.transition_type;
        let transition_amount = transition.amount as i64;

        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO shielded_transitions(state_transition_id, state_transition_type,\
            amount) VALUES ($1, $2, $3);",
            )
            .await?;

        sql_transaction
            .execute(
                &stmt,
                &[&transition_id, &transition_type, &transition_amount],
            )
            .await?;

        // the credits a transition moved are carried on the transition itself so reading them
        // back needs no join, the same way create_transfer does it
        let amount_stmt = sql_transaction
            .prepare_cached(
                "UPDATE state_transitions SET amount = COALESCE(amount, 0) + $1 WHERE id = $2;",
            )
            .await?;

        sql_transaction
            .execute(&amount_stmt, &[&transition_amount, &transition_id])
            .await?;

        Ok(())
    }
}
