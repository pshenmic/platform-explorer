use crate::entities::document::Document;
use crate::entities::validator::Validator;
use crate::models::{
    TenderdashRPCBlockResponse, TenderdashRPCBlockResultsResponse, TenderdashRPCStatusResponse,
    TenderdashRPCValidatorsResponse,
};
use dpp::dashcore::Network;
use reqwest::{Client, Error};
use serde_json::Value;
use std::time::Duration;

pub struct TenderdashRpcApi {
    client: Client,
    tenderdash_url: String,
}

impl TenderdashRpcApi {
    pub fn new(tenderdash_url: String) -> TenderdashRpcApi {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap();

        return TenderdashRpcApi {
            tenderdash_url,
            client,
        };
    }

    pub async fn get_status(&self) -> Result<TenderdashRPCStatusResponse, Error> {
        let url = format!("{}/status", self.tenderdash_url);

        let res = self.client.get(url).send().await?;

        let resp = res.json::<TenderdashRPCStatusResponse>().await?;

        Ok(resp)
    }

    pub async fn get_network(&self) -> Result<Network, Error> {
        let status = self.get_status().await?;

        if status.node_info.network.to_lowercase().contains("evo") {
            Ok(Network::Mainnet)
        } else {
            Ok(Network::Testnet)
        }
    }

    pub async fn get_block_by_height(
        &self,
        block_height: i32,
    ) -> Result<TenderdashRPCBlockResponse, Error> {
        let url = format!("{}/block?height={}", self.tenderdash_url, block_height);

        let res = self.client.get(url).send().await?;

        let resp = res.json::<TenderdashRPCBlockResponse>().await?;

        Ok(resp)
    }
    pub async fn get_block_results_by_height(
        &self,
        block_height: i32,
    ) -> Result<TenderdashRPCBlockResultsResponse, Error> {
        let url = format!(
            "{}/block_results?height={}",
            self.tenderdash_url, block_height
        );

        let res = self.client.get(url).send().await?;

        let resp = res.json::<TenderdashRPCBlockResultsResponse>().await?;

        Ok(resp)
    }

    pub async fn get_validators_by_block_height(
        &self,
        block_height: i32,
    ) -> Result<Vec<Validator>, Error> {
        let url = format!(
            "{}/validators?height={}&per_page=150",
            self.tenderdash_url, block_height
        );

        let res = self.client.get(url).send().await?;

        let resp = res.json::<TenderdashRPCValidatorsResponse>().await?;

        let validators: Vec<Validator> = Vec::try_from(resp).unwrap();

        Ok(validators)
    }
}

pub fn build_dpns_alias(document: Document) -> String {
    let data = document.data.expect(&format!(
        "Could not find data of the DPNS domain document with identifier {}",
        document.identifier
    ));

    let label = data
        .get("label")
        .and_then(|label| label.as_str())
        .expect("Could not find DPNS domain document label");

    let parent_domain_name = data
        .get("parentDomainName")
        .and_then(|parent_domain_name| parent_domain_name.as_str())
        .expect("Could not find DPNS domain document parent domain name");

    format!("{}.{}", label, parent_domain_name)
}

pub fn escape_null_character_string(s: String) -> String {
    if s.contains("\0") {
        s.replace("\0", "")
    } else {
        s
    }
}

pub fn escape_null_character_json_object(value: &mut Value) {
    match value {
        Value::String(s) => {
            *s = escape_null_character_string(s.to_string());
        }
        Value::Array(arr) => {
            for v in arr {
                escape_null_character_json_object(v);
            }
        }
        Value::Object(map) => {
            for v in map.values_mut() {
                escape_null_character_json_object(v);
            }
        }
        _ => {}
    }
}
