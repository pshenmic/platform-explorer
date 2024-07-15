import './NavigationButton.scss'

function NavigationButton({ active, name, subName, activeButton, ...porps }) {

    return (
        <button className={`navigationButton ${!activeButton ? "noActiveButton" : null} ${active === name ? 'activeButton' : null}`} 
        disabled={!activeButton ? true : false} {...porps}>
            {name}
            {
                subName ?
                    <span className="subName">
                        {subName}
                    </span>
                    : null
            }
        </button>
    )
}

export default NavigationButton