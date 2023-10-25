use dpp::data_contract::serialized_version::DataContractInSerializationFormat;
use dpp::data_contracts::SystemDataContract;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use serde_json::Value;
use tokio_postgres::Row;

#[derive(Clone)]
pub struct DataContract {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub schema: Option<Value>,
    pub version: u32,
}

impl From<DataContractCreateTransition> for DataContract {
    fn from(state_transition: DataContractCreateTransition) -> Self {

        match state_transition {
            DataContractCreateTransition::V0(data_contract_create_transition) => {
                let data_contract = data_contract_create_transition.data_contract;

                match data_contract {
                    DataContractInSerializationFormat::V0(data_contract) => {
                        let id = data_contract.id;
                        let version = data_contract.version;
                        let schema = data_contract.document_schemas;
                        let schema_decoded = serde_json::to_value(schema).unwrap();

                        return DataContract{ id: None, identifier: id, schema: Some(schema_decoded), version };
                    }
                }
            }
        }
    }
}

impl From<DataContractUpdateTransition> for DataContract {
    fn from(state_transition: DataContractUpdateTransition) -> Self {

        match state_transition {
            DataContractUpdateTransition::V0(data_contract_update_transition) => {
                let data_contract = data_contract_update_transition.data_contract;

                match data_contract {
                    DataContractInSerializationFormat::V0(data_contract) => {
                        let id = data_contract.id;
                        let version = data_contract.version;
                        let schema = data_contract.document_schemas;
                        let schema_decoded = serde_json::to_value(schema).unwrap();

                        return DataContract{ id: None, identifier: id, schema: Some(schema_decoded), version };
                    }
                }
            }
        }
    }
}

impl From<SystemDataContract> for DataContract {
    fn from(data_contract: SystemDataContract) -> Self {
        let identifier = data_contract.id();
        let source = data_contract.source().unwrap();
        let schema = source.document_schemas;
        let schema_decoded = serde_json::to_value(schema).unwrap();

        return DataContract {
            id: None,
            identifier,
            schema: Some(schema_decoded),
            version: 0
        }
    }
}


impl From<Row> for DataContract {
    fn from(row: Row) -> Self {
        let id: i32 = row.get(0);

        let identifier_str: String = row.get(1);
        let identifier = Identifier::from_string(&identifier_str, Encoding::Base58).unwrap();

        let version:i32 = row.get(2);

        return DataContract{
            id: Some(id as u32),
            identifier,
            schema: None,
            version: version as u32
        }
    }
}


