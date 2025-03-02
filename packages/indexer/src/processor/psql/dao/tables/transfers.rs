use deadpool_postgres::PoolError;
use dpp::platform_value::string_encoding::Encoding::Base58;
use crate::entities::transfer::Transfer;
use crate::processor::psql::PostgresDAO;

impl PostgresDAO {
  pub async fn create_transfer(&self, transfer: Transfer, st_hash: String) -> Result<(), PoolError> {
    let amount = transfer.amount as i64;

    let sender = transfer.sender.map(|t| { t.to_string(Base58)});
    let recipient = transfer.recipient.map(|t| { t.to_string(Base58)});

    let client = self.connection_pool.get().await.unwrap();

    let query = "INSERT INTO transfers(amount,sender,recipient,\
        state_transition_hash) VALUES ($1, $2, $3, $4);";

    let stmt = client.prepare_cached(query).await.unwrap();

    client.query(&stmt, &[&amount, &sender, &recipient, &st_hash]).await.unwrap();

    println!("Created Transfer on {}", &st_hash);

    Ok(())
  }
}