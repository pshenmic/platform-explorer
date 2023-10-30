import {Link} from "react-router-dom";
import IdentitiesListItem from "./IdentitiesListItem";


function IdentitiesList({ items }) {
    return (
        <div className="identity_list">
            {items.map((identity, key) =>
                <IdentitiesListItem
                    key={key}
                    identifier={identity.identifier}
                />
            )}
        </div>
    );
}

export default IdentitiesList;