use dashcore_rpc::json::ProTxInfo;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Hex;
use dpp::platform_value::Value;
use dpp::state_transition::masternode_vote_transition::accessors::MasternodeVoteTransitionAccessorsV0;
use dpp::state_transition::masternode_vote_transition::MasternodeVoteTransition;
use dpp::voting::vote_choices::resource_vote_choice::ResourceVoteChoice;
use dpp::voting::vote_polls::VotePoll;
use dpp::voting::votes::resource_vote::ResourceVote;
use dpp::voting::votes::Vote;

#[derive(Clone)]
pub struct MasternodeVote {
    pub power: i16,
    pub pro_tx_hash: String,
    pub voter_identity: Identifier,
    pub choice: ResourceVoteChoice,
    pub data_contract_identifier: Identifier,
    pub towards_identity_identifier: Option<Identifier>,
    pub document_type_name: String,
    pub index_name: String,
    pub index_values: Vec<Value>,
}

struct VoteInfo {
    pub choice: ResourceVoteChoice,
    pub data_contract_identifier: Identifier,
    pub document_type_name: String,
    pub index_name: String,
    pub index_values: Vec<Value>,
}

impl From<(MasternodeVoteTransition, ProTxInfo)> for MasternodeVote {
    fn from((transition, pro_tx_info): (MasternodeVoteTransition, ProTxInfo)) -> Self {
        let pro_tx_hash = transition.pro_tx_hash().to_string(Hex);
        let voter_identity = transition.voter_identity_id();

        let vote = transition.vote();

        let power = match pro_tx_info.mn_type.unwrap().as_str() {
            "Evo" => 4i16,
            _ => 1i16,
        };

        let vote_info: VoteInfo = match vote {
            Vote::ResourceVote(resource_vote) => match resource_vote {
                ResourceVote::V0(resource_vote_v0) => match resource_vote_v0.clone().vote_poll {
                    VotePoll::ContestedDocumentResourceVotePoll(vote_poll) => VoteInfo {
                        choice: resource_vote_v0.resource_vote_choice,
                        data_contract_identifier: vote_poll.contract_id,
                        document_type_name: vote_poll.document_type_name,
                        index_name: vote_poll.index_name,
                        index_values: vote_poll.index_values,
                    },
                },
            },
        };

        let towards_identity_identifier: Option<Identifier> = match vote_info.choice {
            ResourceVoteChoice::TowardsIdentity(identifier) => Some(identifier),
            ResourceVoteChoice::Abstain => None,
            ResourceVoteChoice::Lock => None,
        };

        MasternodeVote {
            power,
            pro_tx_hash,
            voter_identity,
            choice: vote_info.choice,
            data_contract_identifier: vote_info.data_contract_identifier,
            towards_identity_identifier,
            document_type_name: vote_info.document_type_name,
            index_name: vote_info.index_name,
            index_values: vote_info.index_values,
        }
    }
}
