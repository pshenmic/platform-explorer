use crate::indexer::Indexer;
use std::time::Duration;
use tokio::time;

impl Indexer {
    pub async fn start(&mut self) {
        println!("Indexer loop started");

        let mut interval = time::interval(Duration::from_millis(3000));

        loop {
            interval.tick().await;

            let status_result = self.fetch_last_block().await;

            let last_block_height = match status_result {
                Ok(last_block_height) => last_block_height,
                Err(err) => {
                    println!("{}", err);
                    continue;
                }
            };

            let current_block_height: i32 = self.last_block_height.get();

            self.process_block(last_block_height, current_block_height, &mut interval)
                .await
                .expect("Cannot process block");
        }
    }

    async fn fetch_last_block(&self) -> Result<i32, reqwest::Error> {
        let resp = self.tenderdash_rpc.get_status().await?;

        let blocks_count = resp.sync_info.latest_block_height.parse::<i32>().unwrap();

        Ok(blocks_count)
    }
}
