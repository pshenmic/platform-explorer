use deadpool_postgres::tokio_postgres::{Config as PgConfig, NoTls};
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use dpp::dashcore::Network;
use std::env;
use std::str::FromStr;

pub mod blocks;
pub mod data_contracts;
pub mod documents;
pub mod identities;
pub mod masternode_votes;
mod platform_addresses;
pub mod state_transition_duplicates;
pub mod state_transitions;
pub mod token;
mod token_holders;
pub mod transfers;
pub mod validators;

pub struct PostgresDAO {
    pub(crate) connection_pool: Pool,
    network: Network,
}

impl PostgresDAO {
    pub fn new(network: Network) -> PostgresDAO {
        let postgres_url = env::var("POSTGRES_URL").expect("You've not set the POSTGRES_URL");
        let pg_config = PgConfig::from_str(&postgres_url).expect("Failed to parse POSTGRES_URL");

        let manager = Manager::from_config(
            pg_config,
            NoTls,
            ManagerConfig {
                recycling_method: RecyclingMethod::Fast,
            },
        );

        let connection_pool = Pool::builder(manager).build().unwrap();

        PostgresDAO {
            connection_pool,
            network,
        }
    }
}
