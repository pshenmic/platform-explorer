use dotenv::dotenv;

mod decoder;
mod entities;
mod enums;
mod indexer;
mod models;
mod processor;
mod utils;

extern crate chrono;
extern crate core;

#[tokio::main]
async fn main() {
    dotenv().ok(); // This line loads the environment variables from the ".env" file

    let mut indexer = indexer::Indexer::new().await;

    indexer.start().await;
}
