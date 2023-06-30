import { Link } from "react-router-dom";

function Mod() {
    return (
        <div>
            <div>
                <Link to="items">Items</Link>
            </div>
            <div>
                <Link to="shop">Shop Simulator</Link>
            </div>
            <div>
                <Link to="itemtypes">Item Types</Link>
            </div>
        </div>
    )
}

export default Mod;