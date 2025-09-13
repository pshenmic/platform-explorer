use crate::entities::transfer::Transfer;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::platform_value::string_encoding::Encoding::Base58;

impl PostgresDAO {
    pub async fn create_transfer(
        &self,
        transfer: Transfer,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let amount = transfer.amount as i64;

        let sender = transfer.sender.map(|t| t.to_string(Base58));
        let recipient = transfer.recipient.map(|t| t.to_string(Base58));

        let query = "INSERT INTO transfers(amount, sender, recipient, state_transition_hash) VALUES ($1, $2, $3, $4);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[&amount, &sender, &recipient, &st_hash.to_lowercase()],
            )
            .await
            .unwrap();

        println!("Created Transfer on {}", &st_hash);

        Ok(())
    }
}
