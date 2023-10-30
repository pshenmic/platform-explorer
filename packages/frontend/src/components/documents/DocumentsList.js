import DocumentsListItem from "./DocumentsListItem";
import './DocumentsList.scss'

export default function DocumentsList({documents = [], columnsCount = 1, size='l'}) {
    return (
        <div 
            className='DocumentsList'
            style={{
                columnCount: documents.length > 1 ? columnsCount : 1,
            }}
        >
            {documents.map((document, key) =>
                <DocumentsListItem
                    key={key}
                    document={document}
                />
            )}

            {documents.length === 0 &&
                <div className='DocumentsList__EmptyMessage'>There are no documents created yet.</div>
            }
        </div>
    );
}
