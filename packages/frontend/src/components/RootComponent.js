import { Outlet, Link } from "react-router-dom";
import "./root.css";


export default function RootComponent() {
    return (
        <div>
            <div className="topnav">
                <Link to="/">Home</Link>
                <Link to="/blocks">Blocks</Link>
                <input type="text" placeholder="Search..."/>
            </div>
            <Outlet/>
        </div>
    );
}
