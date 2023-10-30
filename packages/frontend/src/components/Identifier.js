
function Identifier ({value, maxSymbols = -1}) {

    if (maxSymbols > 0 && maxSymbols < value.length) {
        return (
            <>
                {value.slice(0, maxSymbols)}...{value.slice(value.length - maxSymbols, value.length)}
            </>
        );
    } else {
        return (
            <>
                {value}
            </>
        );
    }
}

export default Identifier;