use deadpool_postgres::tokio_postgres::NoTls;
use deadpool_postgres::{Config, ManagerConfig, Pool, RecyclingMethod, Runtime};
use std::env;

pub mod blocks;
pub mod data_contracts;
pub mod documents;
pub mod identities;
pub mod masternode_votes;
pub mod state_transitions;
pub mod token;
pub mod transfers;
pub mod validators;
mod token_holders;

pub struct PostgresDAO {
    pub(crate) connection_pool: Pool,
}

impl PostgresDAO {
    pub fn new() -> PostgresDAO {
        let mut cfg = Config::new();

        let postgres_host = env::var("POSTGRES_HOST").expect("You've not set the POSTGRES_HOST");
        let postgres_db = env::var("POSTGRES_DB").expect("You've not set the POSTGRES_DB");
        let postgres_port: u16 = env::var("POSTGRES_PORT")
            .expect("You've not set the POSTGRES_PORT")
            .parse()
            .expect("Failed to parse POSTGRES_PORT env");
        let postgres_user = env::var("POSTGRES_USER").expect("You've not set the POSTGRES_USER");
        let postgres_pass = env::var("POSTGRES_PASS").expect("You've not set the POSTGRES_PASS");

        cfg.host = Some(postgres_host);
        cfg.port = Some(postgres_port);
        cfg.dbname = Some(postgres_db);
        cfg.user = Some(postgres_user);
        cfg.password = Some(postgres_pass);
        cfg.manager = Some(ManagerConfig {
            recycling_method: RecyclingMethod::Fast,
        });

        let connection_pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls).unwrap();

        PostgresDAO { connection_pool }
    }
}
