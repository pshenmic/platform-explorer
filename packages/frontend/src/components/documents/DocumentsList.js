import DocumentsListItem from "./DocumentsListItem";
import './DocumentsList.scss'


export default function DocumentsList({documents = [], size='l'}) {
    return (

        <div className={'DocumentsList ' + 'DocumentsList--Size' + size.toUpperCase()}>
            
            {documents.map((document, key) =>
                <DocumentsListItem
                    key={key}
                    size={size}
                    document={document}
                />
            )}

            {documents.length === 0 &&
                <div className={'DocumentsList__EmptyMessage'}>There are no documents created yet.</div>
            }

        </div>

    );
}
