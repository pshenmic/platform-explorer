import {StateTransitionEnum} from "../routes/enums/state.transition.type";

const getTransitionTypeString = (id) => {
    const [stateTransitionType] = Object.entries(StateTransitionEnum)
        .filter(([key]) => StateTransitionEnum[key] === id)
        .map(([key,]) => key)

    return stateTransitionType ?? 'UNKNOWN'
}

export {getTransitionTypeString}
