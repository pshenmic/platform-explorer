use crate::entities::document::Document;
use crate::entities::transfer::Transfer;
use crate::processor::psql::PSQLProcessor;
use data_contracts::SystemDataContract;
use deadpool_postgres::Transaction;
use dpp::identifier::Identifier;
use dpp::platform_value::btreemap_extensions::BTreeValueMapPathHelper;
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::state_transition::batch_transition::batched_transition::document_transition::{
    DocumentTransition, DocumentTransitionV0Methods,
};

impl PSQLProcessor {
    pub async fn handle_document_transition(
        &self,
        document_transition: DocumentTransition,
        owner_id: Identifier,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let document = Document::from(document_transition.clone());
        let document_identifier = document.identifier.clone();

        match document_transition {
            DocumentTransition::Transfer(_) => {
                self.dao
                    .assign_document(document.clone(), owner_id, sql_transaction)
                    .await
                    .unwrap();
            }
            DocumentTransition::UpdatePrice(_) => {
                self.dao
                    .update_document_price(document.clone(), sql_transaction)
                    .await
                    .unwrap();
            }
            DocumentTransition::Purchase(_) => {
                let current_document = self
                    .dao
                    .get_document_by_identifier(document.clone().identifier, sql_transaction)
                    .await
                    .unwrap()
                    .expect(&format!(
                        "Could not get Document with identifier {} from the database",
                        document.identifier
                    ));

                self.dao
                    .assign_document(document.clone(), owner_id, sql_transaction)
                    .await
                    .unwrap();

                let transfer = Transfer {
                    sender: document.clone().owner,
                    recipient: current_document.owner,
                    amount: document.clone().price.unwrap(),
                };
                self.dao
                    .create_transfer(transfer, st_hash.clone(), sql_transaction)
                    .await
                    .unwrap();
            }
            _ => {
                self.dao
                    .create_document(document.clone(), Some(st_hash.clone()), sql_transaction)
                    .await
                    .unwrap();
            }
        }

        let document_type = document_transition.document_type_name();

        if document_type == "domain"
            && document_transition.data_contract_id() == SystemDataContract::DPNS.id()
        {
            let label = document_transition
                .data()
                .unwrap()
                .get_str_at_path("label")
                .unwrap();

            let normalized_parent_domain_name = document_transition
                .data()
                .unwrap()
                .get_str_at_path("parentDomainName")
                .unwrap();

            let identity_identifier = document_transition
                .data()
                .unwrap()
                .get_optional_at_path("records.identity")
                .unwrap()
                .expect("Could not find DPNS domain document identity identifier");

            let identity_identifier = Identifier::from_bytes(
                &identity_identifier.clone().into_identifier_bytes().unwrap(),
            )
            .unwrap()
            .to_string(Base58);
            let identity = self
                .dao
                .get_identity_by_identifier(identity_identifier.clone(), sql_transaction)
                .await
                .unwrap()
                .expect(&format!(
                    "Could not find identity with identifier {}",
                    identity_identifier
                ));
            let alias = format!("{}.{}", label, normalized_parent_domain_name);

            self.dao
                .create_identity_alias(identity, alias, st_hash.clone(), sql_transaction)
                .await
                .unwrap();
        }

        self.handle_data_contract_transition(
            Some(st_hash.clone()),
            document.data_contract_identifier,
            sql_transaction,
        )
        .await;

        if document_type == "dataContracts"
            && document_transition.data_contract_id() == self.platform_explorer_identifier
        {
            let data_contract_identifier_str = document_transition
                .data()
                .unwrap()
                .get_str_at_path("identifier")
                .unwrap();

            let data_contract_identifier =
                Identifier::from_string(data_contract_identifier_str, Base58).unwrap();

            let data_contract_name = document_transition
                .data()
                .unwrap()
                .get_str_at_path("name")
                .unwrap();

            let data_contract = self
                .dao
                .get_data_contract_by_identifier(data_contract_identifier, sql_transaction)
                .await
                .expect(&format!(
                    "Could not get DataContract with identifier {} from the database",
                    data_contract_identifier_str
                ))
                .expect(&format!(
                    "Could not find DataContract with identifier {} in the database",
                    data_contract_identifier_str
                ));

            if data_contract.owner == owner_id {
                self.dao
                    .set_data_contract_name(
                        data_contract.clone(),
                        String::from(data_contract_name),
                        sql_transaction,
                    )
                    .await
                    .unwrap();
            } else {
                println!("Failed to set custom data contract name for contract {}, owner of the tx {} does not match data contract", st_hash, document_identifier.to_string(Base58));
            }
        }
    }
}
