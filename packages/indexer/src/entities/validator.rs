use tokio_postgres::Row;

#[derive(Clone)]
pub struct Validator {
    pub pro_tx_hash: String,
    pub id: Option<i32>
}

impl From<Row> for Validator {
    fn from(row: Row) -> Self {
        let pro_tx_hash: String = row.get(0);
        let id: i32 = row.get(1);

        return Validator { pro_tx_hash, id: Some(id) };
    }
}
