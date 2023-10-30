import DocumentsListItem from "./DocumentsListItem";
import './DocumentsList.scss'

export default function DocumentsList({items = [], columnsCount = 1}) {
    return (
        <div 
            className='DocumentsList'
            style={{
                columnCount: items.length > 1 ? columnsCount : 1,
            }}
        >
            {items.map((document, key) =>
                <DocumentsListItem
                    key={key}
                    identifier={document.identifier}
                />
            )}

            {items.length === 0 &&
                <div className='DocumentsList__EmptyMessage'>There are no documents created yet.</div>
            }
        </div>
    );
}
