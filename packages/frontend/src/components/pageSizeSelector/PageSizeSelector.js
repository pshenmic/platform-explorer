import "./page_size_selector.css";

export default function PageSizeSelector({PageSizeSelectHandler, defaultValue, items}) {
    return (
        <div className='items_on_page_selector'>
            <div className='items_on_page_selector__title'>Items on page</div>
            <select onChange={PageSizeSelectHandler} defaultValue={defaultValue}>
                {items.map(item => {
                    return <option value={item} key={'PSS' + item}>{item}</option>;
                })}
            </select>
        </div>
    );
}
