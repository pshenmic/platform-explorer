use dpp::state_transition::state_transition_factory::StateTransitionFactory;
use dpp::state_transition::StateTransition;
use dpp::ProtocolError;

pub struct StateTransitionDecoder {
    st_factory: StateTransitionFactory,
}

impl StateTransitionDecoder {
    pub async fn decode(&self, data: Vec<u8>) -> Result<StateTransition, ProtocolError> {
        let array = data.as_slice();

        let result = self.st_factory.create_from_buffer(array);

        return result;
    }

    pub fn new() -> StateTransitionDecoder {
        let st_factory = StateTransitionFactory {};

        return StateTransitionDecoder { st_factory };
    }
}
