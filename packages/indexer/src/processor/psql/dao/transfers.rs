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

        let sender_id = match sender.clone() {
            Some(id) => {
                self.get_identity_by_identifier(id, sql_transaction)
                    .await?
                    .unwrap()
                    .id
            }
            None => None,
        };

        let recipient_id = match recipient.clone() {
            Some(id) => {
                self.get_identity_by_identifier(id, sql_transaction)
                    .await?
                    .unwrap()
                    .id
            }
            None => None,
        };

        let query = "INSERT INTO transfers(amount, sender, recipient, state_transition_hash, sender_id, recipient_id) VALUES ($1, $2, $3, $4, $5, $6);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(&stmt, &[&amount, &sender, &recipient, &st_hash, &sender_id, &recipient_id])
            .await
            .unwrap();

        println!("Created Transfer on {}", &st_hash);

        Ok(())
    }
}
