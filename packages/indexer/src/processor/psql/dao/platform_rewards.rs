use crate::entities::platform_reward::PlatformReward;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};

impl PostgresDAO {
    pub async fn create_platform_reward(
        &self,
        platform_reward: PlatformReward,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO platform_rewards(block_height, epoch, pro_tx_hash, amount) \
        VALUES ($1, $2, $3, $4);",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &platform_reward.block_height,
                    &platform_reward.epoch,
                    &platform_reward.pro_tx_hash,
                    &platform_reward.amount,
                ],
            )
            .await
            .unwrap();

        Ok(())
    }
}
