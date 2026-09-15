use std::fmt;

#[derive(Clone)]
pub enum IdentityType {
    Regular,
    Masternode,
    MasternodeVoting,
    MasternodeOperator,
}

impl fmt::Display for IdentityType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let identity_type_string = match self {
            IdentityType::Regular => "regular",
            IdentityType::Masternode => "masternode",
            IdentityType::MasternodeVoting => "masternode_voting",
            IdentityType::MasternodeOperator => "masternode_operator",
        };

        write!(f, "{}", identity_type_string)
    }
}
