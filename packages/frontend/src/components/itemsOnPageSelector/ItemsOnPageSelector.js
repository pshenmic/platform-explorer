import "./items_on_page_selector.css";

export default function ItemsOnPageSelector({itemsOnPageSelectHandler, defaultValue, items}) {
    return (
        <div className='items_on_page_selector'>
            <div className='items_on_page_selector__title'>Items on page</div>
            <select onChange={itemsOnPageSelectHandler} defaultValue={defaultValue}>
                {items.map(item => {
                    return <option value={item}>{item}</option>;
                })}
            </select>
        </div>
    );
}
