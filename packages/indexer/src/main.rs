use dotenv::dotenv;

mod indexer;
mod decoder;
mod models;
mod processor;
mod entities;
mod utils;

extern crate chrono;
extern crate core;

#[tokio::main]
async fn main() {
    dotenv().ok(); // This line loads the environment variables from the ".env" file

    let indexer = indexer::Indexer::new().await;

    indexer.start().await;
}
