
function Identifier ({value, maxSymbols = -1}) {
    return maxSymbols === -1 && maxSymbols / 2 < value.length ? 
        value : 
        value.slice(0, Math.floor(maxSymbols / 2)) + '...' + value.slice(value.length - Math.floor(maxSymbols / 2), value.length);
}

export default Identifier;