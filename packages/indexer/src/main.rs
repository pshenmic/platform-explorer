use std::io;

mod indexer;
mod decoder;
mod models;

#[tokio::main]
async fn main() {
    let indexer = indexer::Indexer::new();

    indexer.start().await;

    println!("Press enter to stop daemon");
    io::stdin().read_line(&mut String::new()).unwrap();
}
