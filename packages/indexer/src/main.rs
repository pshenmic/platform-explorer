use std::io;
use dotenv::dotenv;

mod indexer;
mod decoder;
mod models;
mod processor;

#[tokio::main]
async fn main() {
    dotenv().ok(); // This line loads the environment variables from the ".env" file

    let indexer = indexer::Indexer::new();

    indexer.start().await;
}
