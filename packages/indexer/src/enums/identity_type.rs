use std::fmt::Display;

#[derive(Clone, Debug)]
pub enum IdentityType {
    REGULAR,
    OWNER,
    VOTING,
}

impl From<String> for IdentityType {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "regular" => IdentityType::REGULAR,
            "owner" => IdentityType::OWNER,
            "voting" => IdentityType::VOTING,
            _ => {
                panic!("Unsupported identifier type: {}", s);
            }
        }
    }
}

impl Display for IdentityType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
