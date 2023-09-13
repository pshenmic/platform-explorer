use std::io;

mod indexer;
mod decoder;
mod models;
mod processor;

#[tokio::main]
async fn main() {
    let indexer = indexer::Indexer::new();

    indexer.start().await;
}
