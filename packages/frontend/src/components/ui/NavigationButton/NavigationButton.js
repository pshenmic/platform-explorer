import './NavigationButton.scss'

function NavigationButton({ active, name, subName, activeButton, ...porps }) {

    return (
        <button className={`NavigationButton ${!activeButton ? "NavigationButton__NoActive" : null} ${active === name ? 'NavigationButton__Active' : null}`} 
        disabled={!activeButton ? true : false} {...porps}>
            {name}
            {
                subName ?
                    <span className="NavigationButton__SubName">
                        {subName}
                    </span>
                    : null
            }
        </button>
    )
}

export default NavigationButton