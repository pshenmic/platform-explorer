use deadpool_postgres::PoolError;
use tokio_postgres::Row;
use crate::entities::validator::Validator;
use crate::processor::psql::PostgresDAO;

impl PostgresDAO {
  pub async fn get_validator_by_pro_tx_hash(&self, pro_tx_hash: String) -> Result<Option<Validator>, PoolError> {
    let client = self.connection_pool.get().await?;

    let stmt = client.prepare_cached("SELECT pro_tx_hash \
        FROM validators where pro_tx_hash = $1 LIMIT 1;")
      .await.unwrap();

    let rows: Vec<Row> = client.query(&stmt, &[
      &pro_tx_hash
    ]).await.unwrap();

    let validators: Vec<Validator> = rows
      .into_iter()
      .map(|row| {
        row.into()
      }).collect::<Vec<Validator>>();

    Ok(validators.first().cloned())
  }

  pub async fn create_validator(&self, validator: Validator) -> Result<(), PoolError> {
    let client = self.connection_pool.get().await.unwrap();

    let stmt = client.prepare_cached("INSERT INTO validators(pro_tx_hash) \
        VALUES ($1);").await.unwrap();

    client.query(&stmt, &[
      &validator.pro_tx_hash,
    ]).await.unwrap();

    println!("Created Validator with proTxHash {}", &validator.pro_tx_hash);

    Ok(())
  }
}