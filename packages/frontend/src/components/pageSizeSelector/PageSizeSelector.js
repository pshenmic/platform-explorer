import "./PageSizeSelector.scss";

export default function PageSizeSelector({PageSizeSelectHandler, defaultValue, items}) {
    return (
        <div className='PageSizeSelector'>
            <div className='PageSizeSelector__Title'>Items on page</div>
            <select onChange={PageSizeSelectHandler} defaultValue={defaultValue}>
                {items.map(item => {
                    return <option value={item} key={'PSS' + item}>{item}</option>;
                })}
            </select>
        </div>
    );
}
