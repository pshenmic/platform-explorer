use tokio_postgres::Row;

#[derive(Clone)]
pub struct Validator {
    pub pro_tx_hash: String,
}

impl From<Row> for Validator {
    fn from(row: Row) -> Self {
        let pro_tx_hash: String = row.get(0);

        return Validator { pro_tx_hash };
    }
}
