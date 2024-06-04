use std::time::Duration;
use reqwest::{Client, Error};
use crate::entities::validator::Validator;
use crate::models::{TenderdashRPCBlockResponse, TenderdashRPCBlockResultsResponse, TenderdashRPCStatusResponse, TenderdashRPCValidatorsResponse};

pub struct TenderdashRpcApi {
    client: Client,
    backend_url: String,
}

impl TenderdashRpcApi {
    pub fn new(backend_url: String) -> TenderdashRpcApi {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build().unwrap();

        return TenderdashRpcApi { backend_url, client };
    }

    pub async fn get_status(&self) -> Result<TenderdashRPCStatusResponse, Error> {
        let url = format!("{}/status", self.backend_url);

        let res = self.client
            .get(url)
            .send()
            .await?;

        let resp = res
            .json::<TenderdashRPCStatusResponse>()
            .await?;

        Ok(resp)
    }

    pub async fn get_block_by_height(&self, block_height: i32) -> Result<TenderdashRPCBlockResponse, Error> {
        let url = format!("{}/block?height={}", self.backend_url, block_height);

        let res = self.client
            .get(url)
            .send()
            .await?;

        let resp = res
            .json::<TenderdashRPCBlockResponse>()
            .await?;

        Ok(resp)
    }
    pub async fn get_block_results_by_height(&self, block_height: i32) -> Result<TenderdashRPCBlockResultsResponse, Error> {
        let url = format!("{}/block_results?height={}", self.backend_url, block_height);

        let res = self.client
            .get(url)
            .send()
            .await?;

        let resp = res
            .json::<TenderdashRPCBlockResultsResponse>()
            .await?;

        Ok(resp)
    }

    pub async fn get_validators_by_block_height(&self, block_height: i32) -> Result<Vec<Validator>, Error> {
        let url = format!("{}/validators?height={}", self.backend_url, block_height);

        let res = self.client
            .get(url)
            .send()
            .await?;

        let resp = res
            .json::<TenderdashRPCValidatorsResponse>()
            .await?;

        let validators: Vec<Validator> = Vec::try_from(resp).unwrap();


        Ok(validators)
    }
}
