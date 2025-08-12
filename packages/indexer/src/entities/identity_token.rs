use tokio_postgres::Row;

#[derive(Clone)]
pub struct TokenHolder {
    pub token_id: u32,
    pub owner: String,
}

impl From<Row> for TokenHolder {
    fn from(row: Row) -> Self {
        let token_id: i32 = row.get(0);
        let owner: String = row.get(1);

        TokenHolder {
            token_id: token_id as u32,
            owner,
        }
    }
}
