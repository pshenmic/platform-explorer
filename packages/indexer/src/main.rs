use std::env;
use dotenv::dotenv;
use crate::processor::psql::PostgresDAO;

mod decoder;
mod entities;
mod enums;
mod indexer;
mod models;
mod processor;
mod utils;

extern crate chrono;
extern crate core;

mod embedded {
    refinery::embed_migrations!("./migrations");
}

#[tokio::main]
async fn main() {
    dotenv().ok(); // This line loads the environment variables from the ".env" file

    let args: Vec<String> = env::args().collect();

    if args.len() > 1 {
        let arg = args.get(1).unwrap();

        match arg.as_str() {
            "drop_db" => {
                let pool = PostgresDAO::create_pool();
                let client = pool.get().await.expect("Failed to get a database connection");

                client
                    .batch_execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
                    .await
                    .expect("Failed to drop the database schema");

                println!("Database schema dropped");

                return;
            }
            "migrate" => {
                let pool = PostgresDAO::create_pool();
                let mut client = pool.get().await.expect("Failed to get a database connection");

                let report = embedded::migrations::runner()
                    .run_async(&mut **client)
                    .await
                    .expect("Failed to run migrations");

                println!("Applied {} migrations", report.applied_migrations().len());

                return;
            }
            _ => {}
        }
    }

    let indexer = indexer::Indexer::new().await;

    indexer.start().await;
}
